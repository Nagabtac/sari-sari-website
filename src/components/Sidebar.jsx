function Sidebar({ status }) {
  const menuItems = [
    { 
      icon: (
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill="#ffffffff"></path> </g></svg>

        
      ), 
      text: "Home", 
      link: "/" 
    },
    { 
      icon: (
        <svg viewBox="0 -3 1030 1030" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier"><path d="M909.706946 192.347953H25.024283l155.6109-92.318854 571.635349 1.598743 157.436414 90.720111z" fill="#FCDEBE"></path><path d="M935.36619 199.207804H0l178.764314-106.049894h1.893546l573.460863 1.598742z m-885.317624-13.73104h833.999136l-133.625361-76.989071-567.904951-1.576065z" fill="#541018"></path>
        <path d="M6.973237 206.090332h921.442393v678.410914a121.59511 121.59511 0 0 1-121.583771 121.583771h-678.27485A121.59511 121.59511 0 0 1 6.973237 884.501246V206.090332z" fill="#FCDEBE">
          </path><path d="M806.865875 1013.035577H128.568347A128.693072 128.693072 0 0 1 0.022677 884.501246V199.139773h935.354852v685.361473a128.693072 128.693072 0 0 1-128.511654 128.534331zM13.923797 213.040892v671.460354a114.769275 114.769275 0 0 0 114.64455 114.633212h678.297528a114.769275 114.769275 0 0 0 114.64455-114.633212V213.040892z" fill="#541018">
            </path><path d="M2.891342 348.117594h924.877988v506.82393H2.891342z" fill="#34A398"></path><path d="M25.2057 12.007574H908.334976v89.223417H25.2057z" fill="#8D361F"></path><path d="M915.194827 108.045487h-896.882993V5.147723h896.882993zM32.065551 94.325785h869.409574V18.878763H32.065551z" fill="#541018"></path><path d="M110.993522 0h110.959507v111.923287H110.993522zM308.330458 0h110.959507v111.923287h-110.959507zM510.803778 0h110.959507v111.923287H510.803778zM720.148288 0h110.959506v111.923287h-110.959506z" fill="#FED39A">
              </path><path d="M51.511244 382.076691h289.417679v439.27991H51.511244zM381.543777 382.076691h289.417678v24.026486H381.543777zM381.543777 457.002137h289.417678v24.026486H381.543777zM381.543777 531.938922h289.417678v24.026486H381.543777zM381.543777 606.864369h289.417678v24.026486H381.543777z" fill="#FFFFFF"></path><path d="M121.867237 450.142286m-44.03911 0a44.039109 44.039109 0 1 0 88.078219 0 44.039109 44.039109 0 1 0-88.078219 0Z" fill="#34A398"></path></g></svg>
      ), 
      text: "Products", 
      link: "/" 
    },
    { 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ), 
      text: "Settings", 
      link: "/" 
    },
  ]

  return (
    <div className="sidebar"  style={{ display: status ? 'flex' : 'none' }}>
      <div className="sidebar-title">Sari-Sari Store</div>
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item, index) => (
            <li key={index} className="sidebar-nav-item">
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar