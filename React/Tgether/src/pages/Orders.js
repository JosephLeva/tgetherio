import React from 'react'
import tg  from '../images/tgtran.png'
import { Image, Row,Col } from 'react-bootstrap'
import {Button,useNotification} from "web3uikit"
import bg from '../images/lamp.gif'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom';
import OrderUsers from '../components/OrderUsers'
import {useMoralis,useWeb3ExecuteFunction} from "react-moralis";


const URL = 'wss://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production';

function Orders() {
    const [isConnected, setIsConnected] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems]= useState({items:[]})
    const [recipient, setRecipient]= useState({recipient:""})
    const [users, setUsers] = useState({users:[]})
    const [orderId, setOrderId] = useState()
    const [mainWidget, setMainWidget] = useState("items")
    const [adding, setAdding] = useState(false);
    const [userOrderItems, setUserOrderItems] = useState([]);
    const [userTotal, setUserTotal] = useState(0.0)
    const [total, setTotal] = useState(0.0)
    const dispatch = useNotification();
    const contractProcessor = useWeb3ExecuteFunction();
    
    const [pricefeedval, setPriceFeedVal] = useState();



    const {Moralis, account,user} = useMoralis()


    const [isPaused, setPause] = useState(false);
    const ws = useRef(null);
    if (!ws.current) {
      ws.current = new WebSocket(URL);
    }

    

    const StartSess= ()=>{
      if (localStorage.action === "create"){
        onSocketOpen("create",localStorage.recipientId)
        localStorage.setItem("action", "done")

    }  else if (localStorage.action === "join"){
        onSocketOpen("join",localStorage.orderId)
        localStorage.setItem("action", "done")
    }

    }



    useEffect(() => {
        // ws.current = new WebSocket(URL);
        ws.current.onopen = () => StartSess();
        ws.current.onclose = () => console.log("ws closed");

        const wsCurrent = ws.current;

        return () => {
            wsCurrent.close();
        };
    }, []);

    const onSocketOpen = useCallback((action, modifier) => {
        setIsConnected(true);
        console.log(action)
        console.log(modifier)
        if (action=== "create"){
        
            ws.current.send(JSON.stringify({ action: 'createOrder', username: user.id, recipientUsername: modifier }));
        } else if (action === "join"){
            ws.current.send(JSON.stringify({ action: 'addUsers', username: user.id, orderId: modifier }));

        }
      }, []);
      
    
      const onSocketClose = useCallback(() => {

      }, []);


    
    useEffect(() => {

          ws.current.onmessage = data => {
          const json = JSON.parse(data.data)
          console.log(json)
          if (json.orderInfo) {
          setItems({items: json.orderInfo.items});
          calculateTotal(json.orderInfo.items)
          setRecipient({recipient: json.orderInfo.recipient})
          console.log(items)
          console.log(recipient)

          } else if (json.orderId) {
              setOrderId(json.orderId)
              console.log(orderId)

          }
          else if(json.users) {
              setUsers(json.users)
              console.log(users)


          }
          else if (json.transaction){
            alert("We are Attempting Your Transaction <3")
          }
          
        }

      }, [items,recipient,orderId,users]);




    // action and modifier are the inital action we are trying (create or join) and modifier is either recpientid (for create) or orderid (for join)
    // const onConnect = useCallback((action, modifier) => {
    //     if (socket.readyState !== WebSocket.OPEN) {

    //       let socket = new WebSocket(URL);
    //       socket.addEventListener('open', onSocketOpen(action, modifier));
    //       socket.addEventListener('close', onSocketClose);
    //       socket.addEventListener('message', (event) => {
    //         onSocketMessage(event.data);
    //       });
    //     }
    //   }, []);


    const SaveItem = useCallback((orderIdVal) => {
        setAdding(false)
        ws.current.send(JSON.stringify({
          action: 'addItem',
          itemName: document.getElementById("newname").value,
          itemPrice: document.getElementById("newprice").value,
          orderId: orderIdVal
        }));
        
      }, []);


    
    const Transaction = useCallback((user,recipient, orderIdVal) => {

      const iids=[]
      if (userOrderItems != []){

      // create a list of just iids
      for (var i =0; i < userOrderItems.length; i++){
          iids.push(userOrderItems[i].iid)
        
      }
        ws.current.send(JSON.stringify({
          action: 'createTransactions',
          username: user.id,
          orderItemIds: iids,
          orderId: orderIdVal
        }));

      }

      contractTransaction(user,recipient, orderIdVal)

      }, []);


      const handleSuccess= () => {
        dispatch({
          type: "success",
          message: `Nice! Your Tranasaction Was Sent!!`,
          title: "Big Succesful",
          position: "topL",
        });
      };


    
      const handleError= (msg) => {
        dispatch({
          type: "error",
          message: `${msg}`,
          title: "Failed",
          position: "topL",
        });
      };
    // working 0xa89152832F675173244266864454b996430eDe48
    

    const callpricefeeds= async (user,recipient, orderId)=>{
      let options = {
        contractAddress: "0x2F6d82A39F3Fcbb5dBcD3fEB05f9e3e9a19cB5bc",
        functionName: "getLatestPrice",
        abi: [
          {
          "inputs": [],
          "name": "getLatestPrice",
          "outputs": [
            {
              "internalType": "int256",
              "name": "",
              "type": "int256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
        ],
        params: {
        },
      }
      await contractProcessor.fetch({
        params: options,
        onSuccess: (e) => {
          console.log((e.toNumber( )*10**(-8)))
          setPriceFeedVal((userTotal/(e.toNumber( )*10**(-8))).toString())
          console.log(pricefeedval)
          contractTransaction(user,recipient, orderId, (userTotal/(e.toNumber( )*10**(-8))).toString())


        },
        onError: (error) => {
          handleError(error.data.message)
        }
      });

    }



    
    const contractTransaction = async(user,recipient, orderIdVal,price)=>{
      console.log(pricefeedval, "here")
      let options = {
        contractAddress: "0x2F6d82A39F3Fcbb5dBcD3fEB05f9e3e9a19cB5bc",
        functionName: "PayIn",
        abi: [
          {
          "inputs": [
            {
              "internalType": "string",
              "name": "_username",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_recipientusername",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "_orderId",
              "type": "uint256"
            }
          ],
          "name": "PayIn",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
        ],
        params: {
          _username: user.id,
          _recipientusername:recipient.recipient,
          _orderId: parseInt(orderIdVal)
        },
        msgValue: Moralis.Units.ETH(price.substring(0, 10)),
      }
      await contractProcessor.fetch({
        params: options,
        onSuccess: () => {
          handleSuccess();
        },
        onError: (error) => {
          handleError(error.data.message)
        }
      });

    }


    
    const calculateTotal =(itemlist)=>{
      console.log(itemlist, "itemlist")
      var amt = 0
        for (var i =0; i < itemlist.length; i++){

          amt += itemlist[i].itemprice
        }
    
      setTotal(amt)

    }




  const updateadd=()=>{

      if(adding === true){
          setAdding(false)
      }else if (adding === false){
          setAdding(true)
      }
  }


  const calculateUserTotal =()=>{
    const prices=[]

    // create a list of just prices
    for (var i =0; i < userOrderItems.length; i++){
        prices.push(userOrderItems[i].price)
      
    }

    const sum = Object.values(prices).reduce(( a , b) => a + b ,0 )
    setUserTotal(sum)
  }
  






  const addItemUser = (iid, price, orderIdVal) =>{
    // setMyArray(oldArray => [...oldArray, newElement]); is not working :(
    const newItem = {iid: iid, price: price}
    console.log(newItem, "newitem")
    const currentarray = userOrderItems
    currentarray.push(newItem)

    //update user items
    setUserOrderItems(currentarray)
    console.log(userOrderItems, "UOI")

    // send to back end this is owned
    ws.current.send(JSON.stringify({
      action: 'addUserItem',
      username: user.id,
      orderItemId: iid,
      orderId: orderIdVal
    }));


    // recalculate user total
    calculateUserTotal()

  }



  return (
    <div style={{
    }}>
      
      
       <Image
          src={bg}
          style={{
          pointerEvents: "none",
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: "-1",
          top:"0",
          left:"0"
      }}/>



      <Image src={tg}
      style={{
        position:"fixed",
        maxWidth:"20vw",
        bottom: "0",
        right: "0",
        opacity:"0.5"
      }}/>
      <div className="card border-primary mb-3" style={{maxWidth:"70%", margin:"auto", marginTop:"5vh", borderRadius:"15px"}}>

            <div className="card-body ">
                <Row style={{ marginBottom: "3vh" }}>
                    <h2 style={{ textAlign: "center", color: "#9E1ACE",}}> Order ID: {orderId}</h2>
                </Row>
                <Row>

                    <Col>
                        <div className="input-group ml-20" >
                          <span className="input-group-text" style={{backgroundColor:"#9E1ACE", color: "white"}}><i className="fas fa-user"></i></span>

                            <input type="text" className="form-control"  placeholder={recipient.recipient} style={{ maxWidth: "95%", color:"#9E1ACE", backgroundColor:"white",}} aria-label="Recipient's username" aria-describedby="button-addon2" wtx-context="268DF588-CE13-4D87-8DD4-0E8E8CD1D4BF"  disabled={true}/>
                            


                        </div>



                    </Col>
                    <Col>

                        <div className="form-group">
                            <div className="input-group mb-3">
                                <span className="input-group-text" style={{backgroundColor:"#9E1ACE", color: "white"}}>$</span>
                                <input type="text" className="form-control" placeholder={total}aria-label="Amount (to the nearest dollar)" wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472" style={{backgroundColor:"white", color:"#9E1ACE"}} disabled={true}/>
                            </div>
                        </div>




                    </Col>
                </Row>
                <Row>
                    { mainWidget != "items" ? <OrderUsers users={users} />:


                    <div>
                                  <table className="table table-hover" style={{ maxWidth: "95%", margin: "auto", position: "relative" }}>
                            <thead style={{border:"1px solid #9E1ACE", backgroundColor:"#9E1ACE"}}> 
                                <tr>
                                    <th scope="col"style={{textAlign:"center", color:"white"}}>Item  

                                    <button type="button" className="btn btn-outline-dark btn-sm" style={{marginLeft:"3px", color:"white", borderColor:"white"}}onClick={updateadd}><i className="fas fa-plus"></i></button> 
                                    
                                    
                                    </th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"style={{textAlign:"center",color:"white"}} >Amount</th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"style={{textAlign:"center",color:"white"}}>Who's In?</th>



                                </tr>
                            </thead>
                            <tbody>
                            {/* <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                                    <th scope="row"style={{textAlign:"center",color:"white"}}>Toast</th>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center",color:"white"}}>
                                       4.20
                                    </td>
                                    <td></td>
                                    <td>   
                                      <button type="button" style={{marginRight:"7px",backgroundColor:"#9E1ACE", color:"white"}}className="btn btn-outline-warning btn-sm">Add Me!</button>
                                        </td>
                                    <td style={{textAlign:"center"}}>
                                    <span>Joe</span>
                                    </td>
                                

                                </tr>
                                <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                                    <th scope="row"style={{textAlign:"center",color:"white"}}>Toast</th>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center",color:"white"}}>
                                       4.20
                                    </td>
                                    <td></td>
                                    <td>   <button type="button" style={{marginRight:"7px",backgroundColor:"#9E1ACE", color:"white"}}className="btn btn-outline-warning btn-sm">Add Me!</button>
                                        </td>
                                    <td style={{textAlign:"center"}}>
                                    <span></span>
                                    </td>
                                

                                </tr> */}


                                {
                                items.items.map((itemobj)=>(
                                    <tr className="table-info" style={{border:"1px #9E1ACE solid "}} >
                                    <th scope="row"style={{textAlign:"center"}}>{itemobj.itemname}</th>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                       {itemobj.itemprice}
                                    </td>
                                    <td></td>
                                    <td>   
                                    {!itemobj.username ? 
                                      
                                      
                                      <button type="button" style={{marginRight:"7px",backgroundColor:"#9E1ACE", color:"white"}}className="btn btn-outline-warning btn-sm" onClick={()=>{addItemUser(itemobj.oiid, itemobj.itemprice, orderId)}}>Add Me!</button>
                                      :null }
                                        </td>
                                    <td style={{textAlign:"center"}}>
                                    {itemobj.username ? itemobj.username:null }

                                    </td>
                                

                                </tr>
                                    
                                    
                                    ))}

                               
                                { adding=== true ?                            
                                (<tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                                    <td style={{textAlign:"center"}}>
                                    <input type="text" className="form-control" placeholder="Enter Item Name" id="newname" style={{ maxWidth: "200px" }} wtx-context="9A05EF30-5D9B-43D3-84B6-C9091F898755"  />
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                    <input type="number" className="form-control" placeholder="Enter Price" id="newprice" style={{ maxWidth: "200px" }} wtx-context="9A05EF30-5D9B-43D3-84B6-C9091F898755"/>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                    <button type="button" className="btn btn-outline-warning btn-sm" style={{marginTop:"8px", color: "white", backgroundColor:"#9E1ACE"}} onClick={()=>{SaveItem(orderId)}}>Save!</button>

                                    </td>
                                

                                </tr>
                                ) :(null) }


                            </tbody>


                        </table>

            
                    </div>









                                }



                </Row>
                <Row>
                    {/* <Col></Col><Col><h6 className="text-danger">Amount Outstanding: $3.99</h6></Col> */}
                    <div className="btn-group" role="group" aria-label="Basic example" style={{marginTop:"5vh"}}>
                    <button type="button" className="btn  btn-outline-primary" onClick={()=>{setMainWidget("items")}}>Items</button>
                    <button type="button" className="btn  btn-outline-primary"onClick={()=>{setMainWidget("users")}}>Users</button>
                    </div>


                </Row>
                <Row>

                    <button type="button" className="btn btn-dark" style={{ maxWidth: "20vw", margin: "auto", marginTop: "3vh" }} onClick= {async ()=> {
                           await callpricefeeds(user,recipient, orderId)
                            // Transaction(user, recipient, orderId)
                          }
                            }>Make Payment</button>

                    {/* <button type="button" className="btn btn-secondary" style={{ maxWidth: "20vw", margin: "auto", marginTop: "3vh" }} onClick={()=>{ethEnabled()}}>Agree</button> */}

                    
                </Row>

                <div 
                style={{
                  position:"absolute",
                  maxWidth:"15vw",
                  bottom: "0",
                  right: "0",
                  marginRight:"20px"

                }}>
              <div className="form-group">
                <div className="input-group mb-3">

                  <input type="text" className="form-control"  aria-label="Amount (to the nearest dollar)" style={{backgroundColor:"white", }} wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472" disabled={true} placeholder={userTotal} />
                  <button type="button" className="btn btn-dark btn-sm"style={{backgroundColor:"#9E1ACE", color:"white", fontSize:"1rem",}}><i className="fas fa-info-circle"></i></button>
                                    </div>
                </div>
                </div>
                
        </div>
      </div>
      </div>
      

    





  )
}

export default Orders