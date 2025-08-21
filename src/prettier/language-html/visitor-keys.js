const visitorKeys = {
  "front-matter": [],
  root: ["children"],
  element: ["attrs", "children"],
  interpolation: ["children"],
  text: ["children"],
  docType: [],
  comment: [],
  attribute: [],
  cdata: [],
};

export default visitorKeys;
