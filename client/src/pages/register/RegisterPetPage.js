function RegisterPage() {
  return (
    <div>
      <h2>Register</h2>
      <form>
        <div>
          <label>Username: <input name="username" /></label>
        </div>
        <div>
          <label>Password: <input name="password" type="password" /></label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;