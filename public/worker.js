/* eslint-disable no-undef */
var browserInstances = [];
onconnect = (e) => {
  const port = e.ports[0];
  browserInstances.push(port);
  browserInstances[0].addEventListener("message", (e) => {
    const timeout = (Number(e.data) - 30) * 1000;
    setTimeout(() => {
      browserInstances[0].postMessage(`After ${timeout} worker fired message`);
    }, timeout)
  });

  browserInstances[0].start();
};