import React, { useState, useRef, useEffect } from 'react';
import { render } from 'react-dom';
import Axios from 'axios'
import { useLocation } from 'react-router-dom';
function OrderItems() {


    var [adding, setAdding] = useState(false);
    var [newitem, setnewItem] = useState("");
    var [newamount, setnewAmount] = useState("");
    const location = useLocation();
    var[items, setItems] = useState({"items":[ 

    ]})

    var [userid, setUserid]= useState()


    const updateadd=()=>{

        if(adding === true){
            setAdding(false)
        }else if (adding === false){
            setAdding(true)
        }
    }
    


    const save = async ()=>{}
    //     if(!isNaN(parseFloat(newamount))) {
    //         console.log(join.join,"hi")
    //         var j = join.join
    //         const data = {"joinid": j, "itemname": newitem, "itemprice":newamount }
    //         console.log(data)
    //         const response = await Axios.post('https://chyami5bx6.execute-api.us-east-1.amazonaws.com/prod/additem', data);
    //         const respitemname = response.data.itemname
    //         const respitemamount = response.data.itemamount
    //         console.log(response)  
    //         fetchItems() 

    //     }else{
    //         alert("Your Amount Is Not A Number")
    //     }


    // }

    const addItemUser = async (e)=>{}
    //         const data = {"userid": userid, "itemid": e }
    //         console.log(data)
    //         const response = await Axios.post('https://chyami5bx6.execute-api.us-east-1.amazonaws.com/prod/additemuser', data);
    //         const Status = response.data.Status
    //         console.log(response)  
    //         fetchItems() 


    // }




    return (
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
                                    <td>   <button type="button" style={{marginRight:"7px",backgroundColor:"#9E1ACE", color:"white"}}className="btn btn-outline-warning btn-sm">Add Me!</button>
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

                               
                                { adding== true ?                            
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
                                    <button type="button" className="btn btn-outline-warning btn-sm" style={{marginTop:"8px", color: "white", backgroundColor:"#9E1ACE"}} onClick={save}>Save!</button>

                                    </td>
                                

                                </tr>
                                ) :(null) }


                            </tbody>


                        </table>

            
        </div>
    )
}

export default OrderItems
