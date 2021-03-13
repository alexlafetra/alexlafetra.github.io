'use strict';

function Test() {
    return React.createElement(
        "h2",
        null,
        "hey it's a fucking test"
    );
}
ReactDOM.render(React.createElement(Test, null), document.getElementById("gallery"));