const Handlebars = require("handlebars");

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

module.exports = {
  stringify_thread_timestamp: function (ts) {
    const date = new Date(ts);
    const now = new Date();

    const timeS = date.toLocaleTimeString();
    return isSameDay(now, date)
      ? `Today at ${timeS}`
      : `${date.toDateString()} at ${timeS}`;
  },
  thread_href: (threadId) => `/topics/${threadId}`,
  breaklines: (str) => {
    const escaped = Handlebars.Utils.escapeExpression(str);
    const brd = escaped.replace(/(\r\n|\n|\r)/gm, "<br>");
    return new Handlebars.SafeString(brd);
  },
  eq: (a, b) => a === b,
};
