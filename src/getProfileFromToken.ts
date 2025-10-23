export default (id_token: string) => {
    const jwt = JSON.parse(atob(id_token.split(".")[1]));
  
    return { id: 'my-profile', ...jwt };
  };
