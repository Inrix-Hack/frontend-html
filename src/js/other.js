const exampleJavaScriptFn = () => {
  console.log('hello!');
}

const getRoutes = async () => {
  const response = await fetch('http://127.0.0.1:5000/routes');
  const data = await response.json();
  console.log(data);
  return data;
}