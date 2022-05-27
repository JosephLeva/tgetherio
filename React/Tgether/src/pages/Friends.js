import React, { useState, useRef, useEffect } from 'react'
import tg  from '../images/tgtran.png'
import { Image, Row,Col } from 'react-bootstrap'
import {Button} from "web3uikit"
import bg from '../images/lamp.gif'
import {useMoralis} from "react-moralis";
function Friends() {
  var[users, setUsers] = useState({"users":[]})
  const {account} = useMoralis()

  const addfriend= ()=>
  {

    
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
      <div className="card border-primary mb-3" style={{maxWidth:"70%", margin:"auto", marginTop:"5vh"}}>
      <div className="card-body ">

        <div>
             <table className="table table-hover" style={{ maxWidth: "95%", margin: "auto", position: "relative" }}>
            <thead style={{border:"1px solid #9E1ACE", backgroundColor:"#9E1ACE"}}> 
            <tr>
                <th scope="col"style={{textAlign:"center", color:"white"}}>Friends
                <button type="button" className="btn btn-outline-dark btn-sm" style={{marginLeft:"3px", color:"white", borderColor:"white"}}onClick={addfriend}><i className="fas fa-plus"></i></button> 

                </th>
            </tr>
            </thead>
            <tbody>
            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                <th scope="row"style={{textAlign:"center",color:"white"}}>Joe</th>
                
                </tr>
            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
            <th scope="row"style={{textAlign:"center",color:"white"}}>Will</th>
            
            </tr>
            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
            <th scope="row"style={{textAlign:"center",color:"white"}}>Freddie</th>
            
            </tr>

            {users.users.map((user, index)=>( <tr className="table-primary"><th scope="row"style={{textAlign:"center"}}>{user}</th></tr>))}

            
            </tbody>


            </table>
            <h3 style={{textAlign:"center", color: "#9E1ACE", marginTop: "3vh"}}>  Feature Comming Soon &#60;3  </h3>

            </div>
            </div>
      
      
      </div>
      </div>
  )
}

export default Friends