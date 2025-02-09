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
    isLoading: true
  };

  constructor() {
    super();
    // ย้าย Firebase Auth Listener มาไว้ใน constructor
    this.unsubscribeAuth = firebase.auth().onAuthStateChanged((user) => {
      console.log("Auth Changed:", user);
      this.setState({ 
        user: user ? user.toJSON() : null,
        isLoading: false 
      });
    });
  }

  componentWillUnmount() {
    // ทำความสะอาด listener เมื่อ component ถูกทำลาย
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <Card className="m-3 p-3">
          <div style={styles.centerContainer}>
            <p>Loading...</p>
          </div>
        </Card>
      );
    }

    return (
      <Card className="m-3 p-3">
        <Card.Header>{this.title}</Card.Header>

        {/* แสดง LoginBox */}
        <LoginBox user={this.state.user} app={this} />

        {/* แสดงส่วนของข้อมูลเมื่อล็อกอินแล้ว */}
        {this.state.user && (
          <>
            <Card.Body>
              <div className="mb-3 ">
                <Button 
                  onClick={() => this.readData()} 
                  style={styles.actionButton}
                  className="me-2"
                >
                  Read Data
                </Button>
                <Button 
                  onClick={() => this.autoRead()} 
                  style={styles.actionButton}
                >
                  Auto Read
                </Button>
              </div>

              <StudentTable data={this.state.students} app={this} />
            </Card.Body>

            <Card.Footer>
              <div className="mb-3">
                <h5>เพิ่ม/แก้ไขข้อมูล นักศึกษา:</h5>
                <div className="row g-3">
                  <div className="col-md-2">
                    <TextInput label="รหัส" app={this} value="stdid" style={styles.input} />
                  </div>
                  <div className="col-md-2">
                    <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={styles.input} />
                  </div>
                  <div className="col-md-2">
                    <TextInput label="ชื่อ" app={this} value="stdfname" style={styles.input} />
                  </div>
                  <div className="col-md-2">
                    <TextInput label="สกุล" app={this} value="stdlname" style={styles.input} />
                  </div>
                  <div className="col-md-3">
                    <TextInput label="Email" app={this} value="stdemail" style={styles.input} />
                  </div>
                </div>
                <Button 
                  onClick={() => this.insertData()} 
                  style={styles.saveButton}
                  className="mt-3"
                >
                  บันทึก
                </Button>
              </div>
            </Card.Footer>
          </>
        )}

        <Card.Footer>{this.footer}</Card.Footer>
      </Card>
    );
  }

  readData() {
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        const stdlist = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.setState({ students: stdlist });
      })
      .catch(error => {
        console.error("Error reading data:", error);
        alert("เกิดข้อผิดพลาดในการอ่านข้อมูล");
      });
  }

  autoRead() {
    return db.collection("students").onSnapshot((querySnapshot) => {
      const stdlist = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.setState({ students: stdlist });
    }, error => {
      console.error("Error in auto-read:", error);
      alert("เกิดข้อผิดพลาดในการอ่านข้อมูลอัตโนมัติ");
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

  async insertData() {
    try {
      if (!this.state.stdid) {
        alert("กรุณากรอกรหัสนักศึกษา");
        return;
      }

      await db.collection("students").doc(this.state.stdid).set({
        title: this.state.stdtitle,
        fname: this.state.stdfname,
        lname: this.state.stdlname,
        email: this.state.stdemail,
        phone: this.state.stdphone,
      });

      // เคลียร์ฟอร์มหลังบันทึก
      this.setState({
        stdid: "",
        stdtitle: "",
        stdfname: "",
        stdlname: "",
        stdemail: "",
        stdphone: "",
      });

      alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error inserting data:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  }

  async delete(std) {
    if (window.confirm("ต้องการลบข้อมูล?")) {
      try {
        await db.collection("students").doc(std.id).delete();
        alert("ลบข้อมูลสำเร็จ");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  }

  google_login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase.auth().signInWithPopup(provider)
      .catch(error => {
        console.error("Login Error:", error);
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      });
  }

  google_logout() {
    if (window.confirm("ต้องการออกจากระบบ?")) {
      firebase.auth().signOut()
        .then(() => {
          console.log("Logged out successfully");
        })
        .catch(error => {
          console.error("Logout Error:", error);
          alert("เกิดข้อผิดพลาดในการออกจากระบบ");
        });
    }
  }
}

function LoginBox({ user, app }) {
  if (user) {
    return (
      <div className="d-flex align-items-center p-3 justify-content-center mb-5 mt-5">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            className="rounded-circle me-3" 
            width={60} 
            height={60} 
            alt="Profile" 
          />
        ) : (
          <img 
            src="/default-avatar.png" 
            className="rounded-circle me-3" 
            width={60} 
            height={60} 
            alt="Default Profile" 
          />
        )}
        <div className="me-3">
          <div className="fw-bold">{user.displayName}</div>
          <div className="text-muted">{user.email}</div>
        </div>
        <Button 
          variant="outline-danger"
          onClick={() => app.google_logout()}
        >
          ออกจากระบบ
        </Button>
      </div>
    );
  }

  return (
    <div style={styles.centerContainer}>
      <img 
        src="image/cat.jpg" 
        alt="Login" 
        style={styles.loginImage} 
        className="mb-4"
      />
      <Button 
        variant="primary" 
        size="lg"
        onClick={() => app.google_login()}
        style={styles.btnlogin} 
      >
        เข้าสู่ระบบด้วย Google
      </Button>
    </div>
  );
}

function StudentTable({ data, app }) {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>การจัดการ</th>
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
              <Button 
                size="sm" 
                variant="primary"
                className="me-2 text-white"
                onClick={() => app.edit(s)}
              >
                แก้ไข
              </Button>
              <Button 
                size="sm" 
                variant="danger"
                className="text-white"
                onClick={() => app.delete(s)}
              >
                ลบ
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TextInput({ label, app, value, style }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}:</label>
      <input
        type="text"
        className="form-control"
        style={style}
        value={app.state[value]}
        onChange={(ev) => {
          app.setState({ [value]: ev.target.value });
        }}
      />
    </div>
  );
}

const styles = {
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    minHeight: "300px",
  },
  loginImage: {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    color: "white",
  },
  actionButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
  },
  input: {
    width: "100%",
  },
  btnlogin: {
    backgroundColor: "#4285f4",
    color: "white",
    margin : "10px",
    width: "25%",
    padding: "10px",
  },
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9PSA9GkxYATpymB5S010TLFPJS336ejY",
  authDomain: "web2567-7e8b8.firebaseapp.com",
  projectId: "web2567-7e8b8",
  storageBucket: "web2567-7e8b8.firebasestorage.app",
  messagingSenderId: "782085239943",
  appId: "1:782085239943:web:672a12fe6d0d673a117422",
  measurementId: "G-5DQ636PHNS",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Render the app
const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);