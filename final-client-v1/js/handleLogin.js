const handleLogin = async () => {
  const loginPopupAnimationDuration = 500;
  
  const removePopup = () => {
    // animate popup dissapearing
    popupWrapper.style.transitionDuration = `${loginPopupAnimationDuration}ms`;
    popupWrapper.style.visibility = 'hidden';
    popupWrapper.style.opacity = 0;
    setTimeout(() => {
      // remove popup from dom after animation ends
      popupWrapper.parentNode.removeChild(popupWrapper)
      document.body.style.overflow = 'auto'
    }, loginPopupAnimationDuration)
  }
  
  const showPopup = () => {
    // remove body scroll
    document.body.style.overflow = 'hidden'
    // animate popup dissapearing
    popupWrapper.style.transitionDuration = `${loginPopupAnimationDuration}ms`;
    popupWrapper.style.visibility = 'visible';
    popupWrapper.style.opacity = 1;
  }
  
  
  const resetButton = document.querySelector('.js-reset-password-button')
  if (resetButton) resetButton.onclick = () => localStorage.setItem('password', '')
  
  
  const popupWrapper = document.querySelector('.js-login-popup-wrapper'),
    loginForm = popupWrapper.querySelector('.js-login-form'),
    passwordInput = loginForm.querySelector('.js-input-component input');
  
  // const requestUrl = 'http://localhost:3000/sphere-api-middleware'
  // const requestUrl = 'https://ru-1.gateway.serverless.selcloud.ru/api/v1/web/a111e1aadaa5439abf8153af6cb9d16c/default/test-gateway-api-manager'
  const requestUrl = window['serverlessFunctionUrl']
  const logIn = async (username, password) => {
    return axios.post(requestUrl, {
      isLoginRequest: true,
      login: username,
      password: password
    })
  }
  
  
  const username = document.querySelector('input[name="place"]').value
  const password = localStorage.getItem('password');
  
  const loginResponse = await logIn(username, password)
  if (loginResponse.data.result === 'error') {
    // user is not logged in
    showPopup();
  }
  
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    console.log('form submitted')
    const hint = document.querySelector('.js-login-request-status-hint')
    
    const password = passwordInput.value;
    if (password.trim().length === 0) {
      // empty password
      hint.innerHTML = 'Password shouldn\'t be empty'
      loginForm.classList.add('login-form--error')
      console.error('empty password')
      return
    }
    
    const loginResponse = await logIn(username, password)
    const { result, message } = loginResponse.data;
    if (result === 'error') {
      console.error(message)
      
      hint.innerHTML = message;
      loginForm.classList.add('login-form--error');
      return
    }
    
    if (result === 'success') {
      // save password in user's browser
      // remove popup
      console.log(message)
      
      localStorage.setItem('password', password)
      removePopup()
    }
  }
}

handleLogin()
