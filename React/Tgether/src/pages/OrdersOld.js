import React from 'react'
import tg  from '../images/tgtran.png'
import { Image, Row,Col } from 'react-bootstrap'
import {Button} from "web3uikit"
import bg from '../images/lamp.gif'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom';
import OrderUsers from '../components/OrderUsers'
import {useMoralis} from "react-moralis";


const URL = 'wss://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production';

function Orders() {
    const [isConnected, setIsConnected] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems]= useState({items:[]})
    const [recipient, setRecipient]= useState({recipient:""})
    const [users, setUsers] = useState([])
    const [orderId, setOrderId] = useState()
    const [mainWidget, setMainWidget] = useState("items")
    const [save, setSave] = useState(false);

    const {account} = useMoralis()



    




    useEffect(() => {
        const ws = new WebSocket("wss://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production");


        ws.onopen = (event) => {
            if (searchParams.get('orderId') === "create"){
                // Create an Order
                ws.send(JSON.stringify({action: "createOrder", username: account, recipientUsername: searchParams.get('recipient')}));
            }
            else if (searchParams.get('createUser')){
                // Order Exsists and we are adding a user
                ws.send(JSON.stringify({action: "addUsers", username: account, orderId: searchParams.get('orderId') }));}
            else if (searchParams.get('connected')){
                // Order Exsists and we are adding a user
                console.log(searchParams.get('orderId'))
                ws.send(JSON.stringify({action: "getOrderInfo", orderId: searchParams.get('orderId') }));}
    
            setIsConnected(true)
            }
    
        if (searchParams.has("recipient") && orderId ){
            console.log("updateurl")
            setSearchParams({connected: "true",orderId: orderId})
    
        }
        if (searchParams.has("createUser") && orderId ){
            setSearchParams({connected: "true"})
        }




    ws.onmessage = function (event) {
        console.log(event)

        const json = JSON.parse(event.data);
        console.log(json)
            try {
              if (json.orderInfo) {
                setItems({items: json.orderInfo.items})
                setRecipient({recipient: json.orderInfo.recipient})
                console.log(items)
                console.log(recipient) 
              }
              else if(json.users){
                  setUsers(json.users)
                  console.log(users)

              }
              else if(json.orderId){
                setOrderId(json.orderId)
                console.log(json.orderId)
                


            }
            } catch (err) {
              console.log(err);
            }
          };



          
          console.log("hi",newitem,newamount,orderId)

          
            if ( save=== true && isConnected === true && newitem !== "" && newamount !== "" && orderId ){
                console.log("hi",newitem,newamount,orderId)
                ws.send(JSON.stringify({action: "addItem",orderId: orderId, itemName: newitem, itemPrice: newamount }));
                updateadd()
            }
            
           



                
        }, [orderId, items, recipient]);





    // var socket = useRef<WebSocket | null>(null);


  const SaveItem =  ()=>{
    setSave(true)
    const saveit= useCallback(()=>{})
  }

  const addRecipeint= ()=>{}




  var [adding, setAdding] = useState(false);
  var [newitem, setnewItem] = useState("");
  var [newamount, setnewAmount] = useState("");
  const location = useLocation();




  const updateadd=()=>{

      if(adding === true){
          setAdding(false)
      }else if (adding === false){
          setAdding(true)
      }
  }
  






  const addItemUser = async (e)=>{}
  //         const data = {"userid": userid, "itemid": e }
  //         console.log(data)
  //         const response = await Axios.post('https://chyami5bx6.execute-api.us-east-1.amazonaws.com/prod/additemuser', data);
  //         const Status = response.data.Status
  //         console.log(response)  
  //         fetchItems() 


  // }


//   if (searchParams.get('orderId') === "create"){
//         const orderId = null
//         onConnect(orderId)

//     } else{
//         onConnect(searchParams.get('orderId'))
//     }



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
                                <input type="text" className="form-control" placeholder="8.40"aria-label="Amount (to the nearest dollar)" wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472" style={{backgroundColor:"white", color:"#9E1ACE"}} disabled={true}/>
                            </div>
                        </div>




                    </Col>
                </Row>
                <Row>
                    { mainWidget != "items" ? <OrderUsers orderid={orderId} />:


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
                            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                                    <th scope="row"style={{textAlign:"center",color:"white"}}>Toast</th>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center",color:"white"}}>
                                       4.20
                                    </td>
                                    <td></td>
                                    <td>   
                                      {/* <button type="button" style={{marginRight:"7px",backgroundColor:"#9E1ACE", color:"white"}}className="btn btn-outline-warning btn-sm">Add Me!</button> */}
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
                                

                                </tr>


                                {
                                items.items.map((itemobj)=>(
                                    <tr className="table-info">
                                    <th scope="row"style={{textAlign:"center"}}>{itemobj.itemname}</th>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                       {itemobj.itemprice}
                                    </td>
                                    <td></td>
                                    <td>   <button type="button" style={{marginRight:"7px"}}className="btn btn-outline-warning btn-sm" onClick={()=>{addItemUser(itemobj.itemid)}}>Add Me!</button>
                                        </td>
                                    <td style={{textAlign:"center"}}>
                                    {itemobj.users.map((user, index)=>(<span>{(index ? ', ':'')+user}</span>))}

                                    </td>
                                

                                </tr>
                                    
                                    
                                    ))}

                               
                                { adding=== true ?                            
                                (<tr className="table-info">
                                    <td style={{textAlign:"center"}}>
                                    <input type="text" className="form-control" placeholder="Enter Item Name" id="inputDefault" style={{ maxWidth: "200px" }} wtx-context="9A05EF30-5D9B-43D3-84B6-C9091F898755" onChange={e=>{setnewItem(e.target.value)}} />
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                    <input type="number" className="form-control" placeholder="Enter Price" id="inputDefault" style={{ maxWidth: "200px" }} wtx-context="9A05EF30-5D9B-43D3-84B6-C9091F898755" onChange={e=>{setnewAmount(e.target.value)}} />
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style={{textAlign:"center"}}>
                                    <button type="button" className="btn btn-outline-warning btn-sm" style={{marginTop:"8px", color: "white", backgroundColor:"#9E1ACE"}} onClick={()=>{SaveItem()}}>Save!</button>

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

                    <button type="button" className="btn btn-dark" style={{ maxWidth: "20vw", margin: "auto", marginTop: "3vh" }} >Make Payment</button>
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

                  <input type="text" className="form-control"  aria-label="Amount (to the nearest dollar)" style={{backgroundColor:"white", }} wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472" disabled={true} placeholder="4.20" />
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