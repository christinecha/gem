const SplashPage3d = require('./SplashPage3d')

const $form = document.querySelector('form')
const $email = document.querySelector('input[type="email"]')
const $check = document.querySelector('.check')
let email

$email.addEventListener('focus', () => {
  $check.style.display = 'none'
  $email.placeholder = ''
})

$email.addEventListener('blur', () => {
  $email.placeholder = 'Be the first to know'
})

$email.addEventListener('keyup', () => {
  email = $email.value
  console.log(email)
})

$form.addEventListener('submit', (e) => {
  $email.value = email

  if (ga) {
    ga('send', 'event', 'Forms', 'Submit', 'Prelaunch signup')
  }

  requestAnimationFrame(() => {
    if ($email.classList.contains('mce_inline_error')) {
      // nothing
    }
    else {
      $email.value = email
      $check.style.display = 'flex'
    }
  })
})

const splashPage3d = new SplashPage3d()
