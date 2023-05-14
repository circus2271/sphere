
const inputComponents = document.querySelectorAll(".component.input-component");

inputComponents.forEach(component => {
  const { prefix, suffix } = component.dataset,
  inputElement = component.querySelector("input");

  inputElement.oninput = e => {
    e.target.value.length > 0 ?
    component.classList.add("has-value") :
    component.classList.remove("has-value");
  };

  if (suffix && suffix === "delete") {
    const deleteButton = component.querySelector(".suffix button");

    if (deleteButton) {
      deleteButton.onclick = () => {
        inputElement.value = "";
        component.classList.remove("has-value");
        inputElement.focus();
      };
    }
  }


  if (suffix && suffix === "password") {
    // TODO: Improve this shitty code
    const togglePasswordVisibilityButton = component.querySelector(".suffix button");

    togglePasswordVisibilityButton.onclick = () => {
      const { type } = inputElement;

      if (type === 'password') {
        inputElement.type = 'text';
        togglePasswordVisibilityButton.dataset.currentIcon = 'eye-slash';
      }

      if (type === 'text') {
        inputElement.type = 'password';
        togglePasswordVisibilityButton.dataset.currentIcon = 'eye';
      }

      if (inputElement.value.length > 0) inputElement.focus();
    };
  }
});
//# sourceURL=pen.js
    