const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

class App extends React.Component {
  title = (
    <Alert variant="info">
      <b>Work6 :</b> Firebase
    </Alert>
  );
  footer = (
    <div>
      By 663380156-2 ณัชพล สุวรรณอำไพ   <br />
      College of Computing, Khon Kaen University
    </div>
  );
  state = {
    scene: 0,
    students: [],
    stdid: "",
    stdtitle: "",
    stdfname: "",
    stdlname: "",
    stdemail: "",
    stdphone: "",
    user: null,
  };
  render() {
    return (
      <Card className="m-3 p-3">
        <Card.Header>{this.title}</Card.Header>
        <Card.Body>
          <LoginBox user={this.state.user} app={this} />
          <div className="text-center my-3">
            <Button style={{ backgroundColor: "#007bff", color: "white" }} 
                    onMouseDown={(e) => e.target.style.backgroundColor = "#ff5722"}
                    onMouseUp={(e) => e.target.style.backgroundColor = "#007bff"} className="mx-2" 
                    onClick={() => this.readData()}>
              Read Data
            </Button>
            <Button style={{ backgroundColor: "#007bff", color: "white" }} 
                    onMouseDown={(e) => e.target.style.backgroundColor = "#ff5722"}
                    onMouseUp={(e) => e.target.style.backgroundColor = "#007bff"} className="mx-2" 
                    onClick={() => this.autoRead()}>
              Auto Read
            </Button>
          </div>
          <StudentTable data={this.state.students} app={this} />
        </Card.Body>
        <Card.Footer>
          <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b>
          <div className="d-flex flex-wrap gap-2 mt-2">
            <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
            <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100 }} />
            <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120 }} />
            <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120 }} />
            <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
            <TextInput label="Phone" app={this} value="stdphone" style={{ width: 120 }} />
            <Button style={{ backgroundColor: "#007bff", color: "white",width: 120,fontSize: "18px" }} 
                    onMouseDown={(e) => e.target.style.backgroundColor = "#ff5722"}
                    onMouseUp={(e) => e.target.style.backgroundColor = "#007bff"} 
                    className="ms-2" 
                    onClick={() => this.insertData()}>Save</Button>
          </div>
        </Card.Footer>
        <Card.Footer>{this.footer}</Card.Footer>
      </Card>
    );
  }

  readData() {
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        var stdlist = [];
        querySnapshot.forEach((doc) => {
          stdlist.push({ id: doc.id, ...doc.data() });
        });
        console.log(stdlist);
        this.setState({ students: stdlist });
      });
  }
  autoRead() {
    db.collection("students").onSnapshot((querySnapshot) => {
      var stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  }
  edit(std) {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  }

  insertData() {
    db.collection("students").doc(this.state.stdid).set({
      title: this.state.stdtitle,
      fname: this.state.stdfname,
      lname: this.state.stdlname,
      phone: this.state.stdphone,
      email: this.state.stdemail,
    });
  }
  delete(std) {
    if (confirm("ต้องการลบข้อมูล")) {
      db.collection("students").doc(std.id).delete();
    }
  }
  constructor() {
    super();
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ user: user ? user.toJSON() : null });
    });
  }

  google_login() {
    // Using a popup.
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase.auth().signInWithPopup(provider);
  }

  google_logout() {
    if (confirm("Are you sure?")) {
      firebase.auth().signOut();
    }
  }
}
function StudentTable({ data, app }) {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>รหัส</th>
            <th>คำนำหน้า</th>
            <th>ชื่อ</th>
            <th>สกุล</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.title}</td>
              <td>{s.fname}</td>
              <td>{s.lname}</td>
              <td>{s.email}</td>
              <td>
                <Button size="sm" style={{ backgroundColor: "#007bff", color: "white" }} 
                    onMouseDown={(e) => e.target.style.backgroundColor = "#ff5722"}
                    onMouseUp={(e) => e.target.style.backgroundColor = "#007bff"} 
                    onClick={() => app.edit(s)} className="me-2">แก้ไข</Button>
                <Button size="sm"  style={{ backgroundColor: "#ff5722", color: "white" }}
                variant="danger" onClick={() => app.delete(s)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
  
  function TextInput({ label, app, value, style }) {
    return (
      <label className="form-label">
        {label}:
        <input
          className="form-control"
          style={style}
          value={app.state[value]}
          onChange={(ev) => {
            var s = {};
            s[value] = ev.target.value;
            app.setState(s);
          }}
        />
      </label>
    );
  }
  
  function LoginBox({ user, app }) {
    return user ? (
      <div className="text-center" >
        <img src={user.photoURL} className="rounded-circle me-2" width={80} height={80} alt="Profile" />
        {user.email} 
        <Button style={{ backgroundColor: "#007bff",margin: "10px",height: 50, color: "white", width: 120, fontSize: "18px" }}
   onClick={() => app.google_logout()}>Logout</Button>
      </div>
    ) : (
      <div className="text-center">
        <Button style={{ backgroundColor: "#007bff", margin: "10px",height: 50, color: "white", width: 120, fontSize: "18px" }} 
                onMouseDown={(e) => e.target.style.backgroundColor = "#ff5722"}
                onMouseUp={(e) => e.target.style.backgroundColor = "#007bff"} 
                onClick={() => app.google_login()}>Login</Button>
      </div>
    );
  }

function EditButton({ std, app }) {
  return <button onClick={() => app.edit(std)}>แก้ไข</button>;
}
function DeleteButton({ std, app }) {
  return <button onClick={() => app.delete(std)}>ลบ</button>;
}


 
const firebaseConfig = {
  apiKey: "AIzaSyB9PSA9GkxYATpymB5S010TLFPJS336ejY",
  authDomain: "web2567-7e8b8.firebaseapp.com",
  projectId: "web2567-7e8b8",
  storageBucket: "web2567-7e8b8.firebasestorage.app",
  messagingSenderId: "782085239943",
  appId: "1:782085239943:web:672a12fe6d0d673a117422",
  measurementId: "G-5DQ636PHNS",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);

const styles = {
    centerContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "300px", // กำหนดความสูงให้ตรงกลาง
      textAlign: "center",
    },
    loginImage: {
      width: "150px",
      marginBottom: "20px",
    },
    loginButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "10px 20px",
      fontSize: "18px",
      borderRadius: "5px",
    },
    logoutButton: {
      backgroundColor: "red",
      color: "white",
      marginLeft: "10px",
    },
    actionButton: {
      margin: "10px",
      backgroundColor: "#28a745",
      color: "white",
    },
    saveButton: {
      marginTop: "10px",
      backgroundColor: "#007bff",
      color: "white",
    },
    input: {
      width: "150px",
      marginRight: "10px",
    },
  };