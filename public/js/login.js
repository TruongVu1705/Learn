const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "https://maps.app.goo.gl/PzuYxFj8tKsda8z78";
      } else {
        alert(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      alert("Không thể kết nối tới server");
      console.error(error);
    }
  });
}
