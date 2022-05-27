import React from "react";
import "./Home.css";
import "./logo.css"
import { Link } from "react-router-dom";
import logo from '../images/tg2-tran.png'
import bg from '../images/lamp.gif'
import tg from '../images/tgtran.png'
import { useState, useRef, useEffect, useCallback } from 'react'
import {useMoralis} from "react-moralis";
import { Button, Icon } from 'web3uikit'
import { Image } from 'react-bootstrap'

const Home = () => {


  const {account} = useMoralis()

  const [screen, setScreen]= useState("main")

  const URL = 'wss://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production';
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [recipientId, setRecipientId]= useState("");
  const [orderId, setOrderId]= useState("");








  return (
    <div>

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

  


      {
        account ? 
        <>
        { screen === "main" ?
        
         
        <div className="card text-white bg-info mb-3" style={{maxWidth: "70%", margin:"auto", marginTop:"15vh", borderRadius:"30px", zIndex:"0"}}>
          <div className="card-body">
          <div className="d-grid gap-4">
          <button className="btn btn-lg btn-dark" 
            type="button" style={{marginBottom:"3vh"}}
            onClick= {()=>{setScreen("create")}}
            >Create an Order</button>

            <button className="btn btn-lg btn-dark" 
            type="button" style={{marginBottom:"3vh"}}
            onClick= {()=>{setScreen("join")}}
            >Join an Order</button>
          </div>
          </div>
          <Image src={tg}
            style={{
              position:"fixed",
              maxWidth:"20vw",
              bottom: "0",
              right: "0",
              opacity:"0.5"
            }}/>
      
          </div>: null}
        { screen === "join" ?
          <>
          

              <div className="card text-white bg-info mb-3" style={{maxWidth: "70%", margin:"auto", marginTop:"15vh", borderRadius:"30px", zIndex:"0"}}>
              <div className="card-header">
                <Button
                icon="arrowCircleLeft"
                iconLayout="icon-only"
                id="test-button-primary-icon-only"
                onClick={()=>{setScreen("main")}}
                text="Primary icon only"
                color="blue"
                type="button"
              />
                </div>

                <div className="card-body">
                <div className="form-group">
                  <label className="form-label mt-4">Order Id</label>
                  <div className="form-group">
                    <div className="input-group mb-3">
                    <input type="text" className="form-control" id="orderId" paceholder="Please Enter Order Id"  aria-describedby="button-addon2" style={{maxheight:"1rem"}} onChange={(e)=>{
                       setOrderId(document.getElementById("orderId").value)} } />
                      <Link to={`/orders?orderId=${orderId}&createUser=true`}
                        state={{}} 
                        className= "btn btn-dark form-control"
                        style={{maxWidth:"20vw"}}
                        id="button-addon2"
                        >
                          Submit
                          

                        </Link>  
                    </div>
                  </div>
                </div>



                </div>
              </div>
              <Image src={tg}
                style={{
                  position:"fixed",
                  maxWidth:"20vw",
                  bottom: "0",
                  right: "0",
                  opacity:"0.5"
                }}/>
            </>
      
             : null }
        { screen === "create" ?
          <>
          

              <div className="card text-white bg-info mb-3" style={{maxWidth: "70%", margin:"auto", marginTop:"15vh", borderRadius:"30px", zIndex:"0"}}>
              <div className="card-header">
                <Button
                icon="arrowCircleLeft"
                iconLayout="icon-only"
                id="test-button-primary-icon-only"
                onClick={()=>{setScreen("main")}}
                text="Primary icon only"
                color="blue"
                type="button"
              />
                </div>

                <div className="card-body">
                <div className="form-group">
                  <label className="form-label mt-4">RecipientId</label>
                  <div className="form-group">
                    <div className="input-group mb-3">
                      <input type="text" className="form-control"  id="recipient" paceholder="Please Enter Recipient Username"  aria-describedby="button-addon2" onChange={ () =>{
                        setRecipientId(document.getElementById("recipient").value)} }/>
                      <Link to={`/orders?orderId=create&recipient=${recipientId}`}
                        state={{}} 
                        className= "btn btn-dark form-control"
                        style={{maxWidth:"20vw"}}
                        id="button-addon2"
                        >
                          Submit

                        </Link>  
                    </div>
                  </div>
                </div>



                </div>
              </div>
              <Image src={tg}
                style={{
                  position:"fixed",
                  maxWidth:"20vw",
                  bottom: "0",
                  right: "0",
                  opacity:"0.5"
                }}/>
            </>
      
             : null }

       



        </>
        
        
        
        
        
        
        
        
        :
        
        
        <>

        <div
        >
              <div className="containerdiv">                       
              <Image className="logo" src={logo}></Image>
              <div className="shadow"/></div>
              <div className="text">

              
              <div className="card text-white bg-info mb-3" style={{maxWidth: "65%", margin:"auto", marginTop:"15vh", borderRadius:"30px", zIndex:"-1"}}>
              <h1 style={{color:"white", textAlign:"cetner"}}> Please Connect Your Wallet</h1>
              </div>
              </div>



            </div>

          </>







        
      }





    </div>
  );
};

export default Home;
