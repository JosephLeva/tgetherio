import React, { useState, useRef, useEffect } from 'react';

function OrderUsers(users) {
    console.log()
    

  return (
            <div>
             <table className="table table-hover" style={{ maxWidth: "95%", margin: "auto", position: "relative" }}>
            <thead style={{border:"1px solid #9E1ACE", backgroundColor:"#9E1ACE"}}> 
            <tr>
                <th scope="col"style={{textAlign:"center", color:"white"}}>Users</th>
            </tr>
            </thead>
            <tbody>
            {/* <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
                <th scope="row"style={{textAlign:"center",color:"white"}}>Joe</th>
                
                </tr>
            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
            <th scope="row"style={{textAlign:"center",color:"white"}}>Will</th>
            
            </tr>
            <tr className="table-info" style={{border:"1px #9E1ACE solid "}}>
            <th scope="row"style={{textAlign:"center",color:"white"}}>Freddie</th>
            
            </tr> */}

            

            {users.users.map((user, index)=>( <tr className="table-info"><th scope="row"style={{textAlign:"center"}}>{user}</th></tr>))}

            
            </tbody>


            </table>

            </div>
  )
}

export default OrderUsers