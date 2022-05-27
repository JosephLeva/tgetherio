import json
import psycopg2
import boto3
import psycopg2.extras


'''
    Glaring issue with this api is that currently anyone can run these endpoint functions for any user
    
    The current itteration is just a proof of concept
    
    In the future am AWS Lambda backed authorizer will be used to check with moralis to make sure a user
    is who they say they are 
    
    Then all functions where necessary will have checks to make sure this now authorized user
    should be able to make a call to the database before it is made
    
    <3 For now please do not abuse, this project is just for fun <3
    
'''



## API Configurartion ## 
ENDPOINT="https://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production/"
client = boto3.client('apigatewaymanagementapi', endpoint_url=ENDPOINT)


## Connection Functions ##


'''
    sendtoOne is used to send information to a specific connection id
'''
def sendtoOne(id, body):
    try:
        client.post_to_connection(
            Data= body.encode(),
            ConnectionId=id
        )
        return 200
    
    except Exception as e:
        print(e)
        return{
                'statusCode': 500,
                'body': json.dumps('There was an error sending the request to %s' %id)
            }

'''
    sendtoAll is used to recurssivly call send to one for a list of connectionids
    
    Paraemeters: list of ids, body of the response to send to users
'''
def sendtoAll(ids, body):
    sendtoall= [sendtoOne(id, body) for id in ids]
    return sendtoall
   



## Database Functions ##



'''
    getDBSecret is function to get database information
'''
def getDBSecret():
    secret_name = "arn:aws:secretsmanager:us-east-1:367750083312:secret:tgether/dblightsail-KOeUx1"
    region_name = "us-east-1"
    session = boto3.session.Session()
    secretclient = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    try:
        get_secret_value_response = secretclient.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'DecryptionFailureException':
            raise e
        elif e.response['Error']['Code'] == 'InternalServiceErrorException':
            raise e
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            raise e
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            raise e
        elif e.response['Error']['Code'] == 'ResourceNotFoundException':
            raise e
    else:
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
        else:
            secret = base64.b64decode(get_secret_value_response['SecretBinary'])
    
    secret =json.loads(secret)
    return secret



'''
    postgres runs the query neccesary for any operation
    
    Parameters: 
        - query
    Output: output of query
    
    ** FUTURE will want to pass tuple of parameters so no longer using % within strings **
    
'''
def postgres(query):
    secret = getDBSecret()
    #create the order so we can use the order id as our dynamo id for the connection
  
    conn = psycopg2.connect(host=secret["host"],
                        port='5432',
                        user= secret["username"],
                        password=secret["password"],
                        database=secret["dbname"])
    conn.autocommit = True

    cursor = conn.cursor(cursor_factory= psycopg2.extras.RealDictCursor)
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close
    return rows



## Functions for Websocket ## 


'''
    getAllConenctions is used by most functions that need connection ids for an order
    not used by getUsers as we get the info from there
    
    Parameters
        - orderId
        
    Output: list of connection ids


'''

def getAllConnections(orderId):
    getconns = "select connectionid from tg.order_users where oid=%s" % ( orderId )
    connectionids= json.loads(json.dumps(postgres(getconns)))
    print(connectionids)
    listconnectionids= [user["connectionid"] for user in connectionids]
    print(listconnectionids)
    
    return listconnectionids
    





'''
'''
async def connect(body):
    print("connect")
    pass 
    
'''
'''
async def disconnect(body):
    print("disconnect")

    pass
'''
'''
def default(body):
    print("default")
    pass



'''

    Add Item takes in all the necessary information for an order_item object
    It then returns all current items to all users
    
    Parameters: 
        - orderid, itemName, itemPrice

'''

def addItem(connectionId, body):
    bodyDict= json.loads(body)
    addItem = "insert into tg.order_items (oid, itemname, itemprice, createddate) values (%s,'%s', %s, now()) RETURNING *" % (int(bodyDict["orderId"]),bodyDict["itemName"], float(bodyDict["itemPrice"]) )
    postgres(addItem)
    
    ## now we must call getOrderInfo so we can let everyone know that an item has been added ###
    
    getOrderInfo(connectionId,body)
    
    
  
 
'''
    addRecipient is used by the createOrder function to do as implies
    Parameters: 
        -orderid, recipeientUsername
 
'''
def addRecipent(body):
    bodyDict= json.loads(body)
    
    ### with uppaid we create our recipient ##
    createRecipient = " insert into tg.order_recipient (oid, username,createddate, uppaid) values(%s, '%s', now(), (select uppaid from tg.userpreferredpayout where username= '%s') ) RETURNING *" % (int(bodyDict["orderId"]), bodyDict["recipientUsername"], bodyDict["recipientUsername"] )
    postgres(createRecipient)    
    
   

'''
    addUserItem is used to update the user who "owns" paying for an item
    this is to avoid multiple users paying for the same item
    
    Parameters: 
        -username, orderId, orderItemId
        

    Output: Call getOrderInfo so everyone knows the item has been updated
'''
    
def addUserItem(connectionId, body):
    bodyDict= json.loads(body)
    
    ## Future should probably check if someone already has ownership before we allow an update for now we will hope front end is enough to avoid this ##
    
    addUserItem = "update tg.order_items set username= '%s' where oiid= %s  RETURNING * " % ((bodyDict["username"]),int( bodyDict["orderItemId"]) )
    postgres(addUserItem)
    
    getOrderInfo(connectionId, body)




"""
    For addUsers we want to insert into the order users table
    we need to ensure that we only return a send to all when not running a create user
    
    Parameters:
        - orderId, username, connectionId
        
    
"""

def addUsers(connectionId, body):
    bodyDict= json.loads(body)
    createuser = "insert into tg.order_users (oid, username, createddate,connectionid) values (%s,'%s',now(),'%s') RETURNING *" % (int(bodyDict["orderId"]),bodyDict["username"], connectionId )
    postgres(createuser)
    
    
    ## we must check if the function call was done by create order, if it is not ##
    ## We must return to all users in the order the new user list ##
    
    if "isCreateOrder" not in body:
        allusers= getUsers(connectionId, body)
        orderItems= getOrderInfo(connectionId,body)
        
        #sent out orderId so the front end knows
        
        sendtoOne(connectionId, "{\"orderId\": \"%s\"}" % bodyDict["orderId"])
        
    
    
    
    
    
"""
    The Create order function takes creates an order object 
    It then calls the addUsers function in order to add the connected user to the function
    After it calls the add Recipient Funciton To add the recipent for the order
    
    Parameters: 
        username, recipientUsername
    
    Output: 
        order id


"""
def createOrder(connectionId, body):
    createorder= "insert into tg.orders (createddate) values(now()) RETURNING oid"
    orderId= json.loads(json.dumps(postgres(createorder)))[0]['oid']
    
    ## we update the body so we can use our new orderId in addUsers ##
    jsonbody= json.loads(body)
    jsonbody["orderId"]= orderId
    
    ## add in so we know this is a creat order request, we dont want to return within that function if it is ###
    jsonbody["isCreateOrder"]= "true"

    ## call user add to add our current user to the order ##
    useradded= addUsers(connectionId, json.dumps(jsonbody))
    
    ## call recpient add to add in our recpient to the order ##
    recipientadded= addRecipent(json.dumps(jsonbody))
    
    sendtoOne(connectionId, "{\"orderId\": \"%s\"}" % orderId)
    
    getOrderInfo(connectionId, json.dumps(jsonbody))
    

'''
    CreateTransaction is used to track that someone is attempting to pay for an item
    these transactions will later be checked by the external adapter and marked as compelted or failed 
    
    For this function we need all items the user is trying to pay for
    
    
    Parameters:
        -username, orderId, a list of orderItemIds

'''

def createTransactions(connectionId, body):
    bodyDict= json.loads(body)
    
    ## We want to create a transaction record for each item ##
    itemids = bodyDict["orderItemIds"]
    createTransaction = "insert into tg.transactions (oiid, username,oid, createddate) values"

    
    for i in range(0, len(itemids)):
        createTransaction += "( %s,'%s', %s, now())"% (int(itemids[i]), bodyDict["username"], int(bodyDict["orderId"]))
        if i < len(itemids)-1:
            createTransaction+=','
    createTransaction += "Returning *"
        
    # (%s,(select ouid from tg.order_users where oid= %s and username= '%s'),  now()) RETURNING *" % (int(itemid),int(bodyDict["orderId"]), bodyDict["username"])
    postgres(createTransaction)
    
    ## make our message ##
    message = {}
    message["transaction"]= "We are attempting your transactions"
    
    sendtoOne(connectionId, json.dumps(message))
    
    


'''
    getOrderInfo is used whenever someone edits the order to return to all connected
    the item information and recipient to be used by the frontend
    
    Parameters:
        - orderId, connecitonid(taken but not used)

'''


def getOrderInfo(connectionId, body):
    bodyDict= json.loads(body)
    
    ## first we must get all connections attached to our order 
    allconnections= getAllConnections(int(bodyDict["orderId"]))
    
    ## we need all items their price, wheter or not theyve been paid, and who is paying for them ## 
    getitems = "select oiid, itemname, itemprice, ispaid, oid, username from tg.order_items where oid='%s'" % (bodyDict['orderId'] )
    
    ## turn that into a dictionary 
    items = json.loads(json.dumps(postgres(getitems)))
    
    ## we need recipient's username to show on frontend
    getrecipient= "select username from tg.order_recipient where oid='%s'" % (bodyDict['orderId'] )
    
    ## store in a dictionary so that we can concatonate with our items ##
    recipeinet= json.loads(json.dumps(postgres(getrecipient)))[0]["username"]
    
    ## orderinfo object will concatonate recipient and items so we can send them as one object to the frontend ##
    
    orderinfo = {"orderInfo": {}}
    orderinfo["orderInfo"]["items"]= items
    orderinfo["orderInfo"]["recipient"]=recipeinet
    
    #send to all connections
    
    sendtoAll(allconnections, json.dumps(orderinfo))
    getUsers(connectionId, body)
    
    

'''
    Get users gathers all users for a given order and sends them to all connections 
    
    Parameters: 
        - orderId, connectionId
    
    Output: list of users

'''
    
def getUsers(connectionId, body):
    bodyDict= json.loads(body)
    getusers = "select ouid,oid,username,connectionid from tg.order_users where oid=%s" % (bodyDict['orderId'] )
    allusers= json.loads(json.dumps(postgres(getusers)))
    
    ## create the list of connection ids we need to send to sendtoAll ##
    connectionidlist= [l["connectionid"] for l in allusers]
    
    ## Instantiate username list as a dictionary for easy processing when sent to sendtoAll ##
    usernamelist= {}
    
    usernamelist["users"] = [l["username"] for l in allusers]

    sendtoAll(connectionidlist, json.dumps(usernamelist))
    


'''
    removeUserItem allows a user to remove themself from a particular item
    makes call to getOrderInfo to let everyone know
    
    Parameters:
        - orderItemId, orderId

'''
def removeUserItem(connectionId, body):
    bodyDict= json.loads(body)
    remUserItem = "update tg.order_items set username= null where oiid= %s  RETURNING *" % (int(bodyDict["orderItemId"]) )
    postgres(remUserItem)
    
    
    getOrderInfo(connectionId, body)
    

'''
    updateSettings is used to upadate userprefferedpayout method for users
    
    Paraemeters: 
        - username, address, chain

'''

def updateSettings(connectionId,body):
    bodyDict= json.loads(body)
    
    updatesettings = "insert into tg.userpreferredpayout (username, address, cid) values ('%s','%s',(select cid from tg.chains where \"chain\"= '%s')) on conflict (username) do update set cid=(select cid from tg.chains where \"chain\"= '%s') , \"address\" = '%s'   RETURNING *" % (bodyDict["username"],bodyDict["address"],bodyDict["chain"],bodyDict["chain"],bodyDict["address"] )
    settings= postgres(updatesettings)
    print(settings)
    settingsinfo= {}
    settingsinfo["settingssaved"]= settings
    

    sendtoOne(connectionId, json.dumps(settingsinfo))
    

''''
    getSettigns is used to get the settings for a user
    Parameters: 
        -username

'''
def getSettings(connectionId, body):
    bodyDict= json.loads(body)
    getsettings = "select * from tg.userpreferredpayout p inner join tg.chains c on p.cid= c.cid where username = '%s'" % (bodyDict["username"])
    settings= postgres(getsettings)
    
    settingsinfo= {}
    settingsinfo["gotsettings"]= settings

    sendtoOne(connectionId, json.dumps(settingsinfo))
    
    
    
    
    
    
    
    


## Router used to call correct function from lambda_handler ##      

router={
    "$connect": connect,
    "$disconnect": disconnect,
    "$default": default,
    "addItem": addItem,
    "addRecipent": addRecipent,
    "addUserItem": addUserItem,
    "addUsers": addUsers,
    "createOrder": createOrder,
    "createTransactions": createTransactions,
    "getUsers": getUsers,
    "removeUserItem": removeUserItem,
    "getOrderInfo": getOrderInfo,
    "updateSettings": updateSettings,
    "getSettings": getSettings,
}
    
    

def lambda_handler(event, context):
    print(event)
    
    if event["requestContext"]:
        connectionId = event["requestContext"]["connectionId"]
        routeKey= event["requestContext"]["routeKey"]
        print(routeKey)
        
        if 'body' in event:
           router[routeKey](connectionId, event['body'])
        else: 
           router[routeKey]('{}')

            


        
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }










