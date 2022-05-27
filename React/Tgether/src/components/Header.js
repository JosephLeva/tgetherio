import React from 'react'
// import '../index.css'
import logo from '../images/tgether.png'
import { ConnectButton } from 'web3uikit'
import { Navbar, Nav, Container,NavDropdown } from 'react-bootstrap'
function Header() {
  return (
      <>
            <Navbar bg="info" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/" style={{ fontSize:"2rem", border:"1px solid #9E1ACE", borderRadius:"15px", padding:"2px 8px 2px 8px"}}><span style={{color:"#9E1ACE"}}>tg</span>ether</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/friends" className="btn btn btn-outline-primary p-3 m-2 ">Friends</Nav.Link>
                            <Nav.Link href="/pastorders" className="btn btn btn-outline-primary p-3 m-2 ">Orders</Nav.Link>

                        </Nav>
                        <Nav className="pull-right ">
                            {/* <Nav.Link disabled={true} className="btn btn btn-outline-primary p-3 m-2 ">About Us</Nav.Link> */}
                            <Nav.Link href="/settings" className="btn btn btn-outline-primary p-3 m-2 ">Settings</Nav.Link>
                            <div style={{marginTop:"15px", margin:"auto"}} >
                            <ConnectButton />
                            </div>
                            

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
      </>

    
    

    
        )
    }
    

export default Header
