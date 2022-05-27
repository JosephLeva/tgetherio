from bridge import Bridge
import psycopg2
import boto3
from botocore.exceptions import ClientError
import json
class Adapter:

    def __init__(self, input):
        self.id = input.get('id', '1')
        self.request_data = input.get('data')
        if self.validate_request_data():
            self.bridge = Bridge()
            self.set_params()
            self.create_request()
        else:
            self.result_error('No data provided')

    def validate_request_data(self):
        if self.request_data is None:
            return False
        if self.request_data == {}:
            return False
        return True

    def set_params(self):
        self.username = self.request_data.get("username")
        self.address = self.request_data.get("address")


        
    ## Database Functions ##
    
    
    
    '''
        getDBSecret is function to get database information
    '''
    def getDBSecret(self):
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
        print(secret)
        return secret
    
    
    
    '''
        postgres runs the query neccesary for any operation
        
        Parameters: 
            - query
        Output: output of query
        
        ** FUTURE will want to pass tuple of parameters so no longer using % within strings **
        
    '''
    def postgres(self,query):
        secret = self.getDBSecret()
        #create the order so we can use the order id as our dynamo id for the connection
      
        conn = psycopg2.connect(host=secret["host"],
                            port='5432',
                            user= secret["username"],
                            password=secret["password"],
                            database=secret["dbname"])
        conn.autocommit = True
    
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close
        return rows       
        
      
        
    def create_request(self):
        try:
            # Off Chain Computation We need to include in varibable data the address
            #grab out username,  order id, msg.value in eth and pricefeed conversion
            
            address = self.address
            username = self.username
            
            print(address)
            print(username)
            

            
    
            #check in sql for user address set
            
            getAddress = "SELECT address from tg.userpreferredpayout where username = '%s'" % (username)
            rows = self.postgres(getAddress)
            if rows[0][0] == address:
                isSucess= 1
            else: 
                isSucess= 0

    
   
    

            data={}
            result={}
            result["issuccess"] = isSucess
            self.result= result
            data['result']= self.result

        

            self.result_success(data)
        except Exception as e:
            print(e)
            self.result_error(e)
        finally:
            self.bridge.close()


    def result_success(self, data):
        self.result = {
            'jobRunID': self.id,
            'data': data,
            'result': self.result,
            'statusCode': 200,
        }

    def result_error(self, error):
        self.result = {
            'jobRunID': self.id,
            'status': 'errored',
            'error': f'There was an error: {error}',
            'statusCode': 500,
        }
