const select = document.querySelector("select");
const para = document.querySelector("p");
const usernameLabel = document.querySelector("username")

select.addEventListener("change", setLanguage);

function setLanguage() {
  const choice = select.value;

  switch (choice) {
    case "EN":
      para.textContent =
        "Please Login";
        document.getElementsByName('username')[0].placeholder='Username';
        document.getElementsByName('password')[0].placeholder='Password';
        document.getElementsByClassName('forgot_pass_anchor')[0].textContent='forgot password?';
        document.getElementsByClassName('sign-in-button')[0].textContent='Sign in';
      break;
    case "DE":
      para.textContent =
        "Bitte anmelden";
        document.getElementsByName('username')[0].placeholder='Benutzername';
        document.getElementsByName('password')[0].placeholder='Kennwort';
        document.getElementsByClassName('forgot_pass_anchor')[0].textContent='Kennwort vergessen?';
        document.getElementsByClassName('sign-in-button')[0].textContent='Anmelden';
      break;
    case "IT":
      para.textContent =
        "Accedi per favore"
        document.getElementsByName('username')[0].placeholder='Nome utente';
        document.getElementsByName('password')[0].placeholder='Password';
        document.getElementsByClassName('forgot_pass_anchor')[0].textContent='dimenticato la password?';
        document.getElementsByClassName('sign-in-button')[0].textContent='Accedere';
      break;
      para.textContent = "";
  }
}


