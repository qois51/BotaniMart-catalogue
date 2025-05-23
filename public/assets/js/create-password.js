const passwordInput = document.getElementById("username");

passwordInput.addEventListener("input", function () {
    const val = passwordInput.value;
    document.getElementById("uppercase").checked = /[A-Z]/.test(val);
    document.getElementById("lowercase").checked = /[a-z]/.test(val);
    document.getElementById("number").checked = /\d/.test(val);
    document.getElementById("special").checked = /[\W_]/.test(val);
    document.getElementById("length").checked = val.length >= 8;
});
