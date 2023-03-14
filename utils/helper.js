const log = (function (environment) {
  if (environment === "production") {
    return () => {};
  }
  return (...args) => {
    console.log(...args);
  };
})(process.env.NODE_ENV);

function getQueryVariable(query, variable) {
  // var query = window.location.search.substring(1);
  var vars = query.slice(query.indexOf("?") + 1).split("&");
  // var vars = query.slice(query.indexOf("/") + 1).split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  // console.log("Query variable %s not found", variable);
}

export { log, getQueryVariable };
