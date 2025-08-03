function LoginPage() {
  return (
    <div>
      <h2>Login</h2>
      <form>
        <div>
          <label>Username: <input name="username" /></label>
        </div>
        <div>
          <label>Password: <input name="password" type="password" /></label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;