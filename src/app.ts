import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "rola" });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });
  res.send();
});

app.post("/parters", (req, res) => {
  const { name, email, password, company } = req.body;
});

app.post("/customers", (req, res) => {
  const { name, email, password, address, phone } = req.body;
});

app.post("/partners/events", (req, res) => {
  const { name, description, date, location } = req.body;
});

app.get("/partners/events", (req, res) => {});

app.get("/partners/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});

app.get("/events", (req, res) => {});

app.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});

app.listen(3001, () => {
  console.log("Running at 3001");
});
