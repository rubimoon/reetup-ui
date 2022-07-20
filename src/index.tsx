import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./app/layout/styles.css";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { store } from "./app/store/configureStore";
import App from "./app/layout/App";
import reportWebVitals from "./reportWebVitals";
import ScrollToTop from "./app/layout/ScrollToTop";
import { Provider } from "react-redux";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { ErrorFallback } from "./app/errors/ErrorFallback";

export const history = createBrowserHistory();

ReactDOM.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Provider store={store}>
      <HistoryRouter history={history}>
        <ScrollToTop />
        <App />
      </HistoryRouter>
    </Provider>
  </ErrorBoundary>,

  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
