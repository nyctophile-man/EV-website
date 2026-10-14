import './Navbar.css' 
const Navbar = ({ setShowLogin }) => {

  return (
    <div className='nav'>
      <div className="nav-logo">Electric Vehicle</div>
      <ul className='nav-menu'>
        <li><a href="index.html">Home</a></li>
        <li><a  onClick={()=>setShowLogin(true)} style={{cursor:'pointer'}} >Explore</a></li>
       {/* <li className='nav-contact'><a href="#contact-us">Contact</a></li> */}
      </ul>
    
    </div>
  )
}

export default Navbar
