import React, { useState, useRef, useEffect, useCallback } from 'react'
import tg  from '../images/tgtran.png'
import { Image, Row,Col } from 'react-bootstrap'
import {Button,useNotification} from "web3uikit"
import bg from '../images/lamp.gif'
import {useMoralis, useWeb3ExecuteFunction} from "react-moralis";
import {Dropdown} from 'web3uikit'

const URL = 'wss://4j17j96hl4.execute-api.us-east-1.amazonaws.com/production';

function Settings() {
  const {account, user} = useMoralis()
  const [isConnected, setIsConnected]= useState(false)
  const contractProcessor = useWeb3ExecuteFunction();
  const dispatch = useNotification();


  const ws = useRef(null);
  if (!ws.current) {
    ws.current = new WebSocket(URL);
  }

  useEffect(() => {
    // ws.current = new WebSocket(URL);
    ws.current.onopen = () => onSocketOpen();
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;

    return () => {
        wsCurrent.close();
    };
}, []);

const onSocketOpen = useCallback(() => {
  setIsConnected(true);
  ws.current.send(JSON.stringify({ action: 'getSettings', username: account }));
  }, []);


    
  useEffect(() => {

    ws.current.onmessage = data => {
    const json = JSON.parse(data.data)
    console.log(json)
    if (json.gotsettings){
      
    }else if (json.settingssaved){
      alert("Settings Saved! <3")
      
    }
    
  }

    }, []);

    const Save = useCallback((user, account) => {
        ws.current.send(JSON.stringify({
          action: 'updateSettings',
          username: user.id,
          chain: 1,
          address: account


        }));

        transaction(user,account)

        
      
      }, []);

    const transaction = async (user,account)=>{
      let options = {
        contractAddress: "0xa89152832F675173244266864454b996430eDe48",
        functionName: "setPayout",
        abi: [
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "_username",
                "type": "string"
              },
              {
                "internalType": "address",
                "name": "_payoutad",
                "type": "address"
              }
            ],
            "name": "setPayout",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        params: {
          _username: user.id,
          _payoutad: account,
        },
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

    const handleSuccess= () => {
      dispatch({
        type: "success",
        message: `Settings Saved On The Blockchain!!`,
        title: "We did it",
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
          <h3 style={{textAlign:"center", color: "#9E1ACE"}}>Settings</h3>
          <Row style={{marginTop:"5vh"}}>
            <Col><h5 style={{color: "#9E1ACE"}}> Username</h5> </Col>
            <Col>                 
             <input type="text" className="form-control"  aria-label="Amount (to the nearest dollar)" style={{backgroundColor:"white", }} wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472"  placeholder={user?.id} disabled= {true} />


          </Col>
          </Row>
          <Row style={{marginTop:"5vh"}}>
            <Col><h5 style={{color: "#9E1ACE"}}>Preffered Chain</h5> </Col>
            <Col >
                <Dropdown
                  icon="network"
                  label="Network: "
                  onChange={function noRefCheck(){}}
                  onComplete={function noRefCheck(){}}
                  showSelected= "true"

                  options={[
                    {
                      id: 'eth',
                      label: 'Ethereum'
                    },
                    {
                      id: 'poly',
                      label: 'Polygon'
                    },
                    {
                      id: 'bsc',
                      label: 'Binance Smart Chain'
                    },
                    {
                      id: 'avax',
                      label: 'Avax'
                    },
                    {
                      id: 'fantom',
                      label: 'Fantom'
                    }
                  ]}
                />


            
            </Col>
          </Row>

          <Row style={{marginTop:"5vh"}}>
            <Col><h5 style={{color: "#9E1ACE"}}> Address</h5> </Col>
            <Col>                 
             <input type="text" className="form-control"  aria-label="Amount (to the nearest dollar)" style={{backgroundColor:"white", }} wtx-context="A5177AFF-6A2A-4352-A199-7D1A52EAE472"  placeholder={account}  disabled= {true}/>


          </Col>
          </Row>
          <Row style={{marginTop:"3vh"}}>

          <button type="button" className="btn btn-dark" style={{ maxWidth: "20vw", margin: "auto", marginTop: "3vh" }}
          onClick={ () => {
            Save(user, account)
          }}
          >Save</button>

          </Row>


            </div>
            </div>
      
      
      </div>
      </div>  )
}

export default Settings