class App extends React.Component {
    state = {
        qlist: [],
        status : 0,
        answers :{},
        score : 0,
        valid : false,


      }
      checkAnswer(){
        var score=this.state.qlist.reduce((total,q,i)=>{
          total += (q.answer==this.state.answers["q"+i])?1:0;
          return total;
        },0)
        this.setState({status:2, score:score})
      }


    // ตรวจสอบว่าทำโจทย์ทุกข้อ 
    validate(){
        var valid=this.state.qlist.every((q,i)=>this.state.answers["q"+i])
        this.setState({valid})
    }
   

      constructor() {
        super();
        this.load_data();
      }
      async load_data() {
        var res = await fetch("quiz2.json");
        this.setState({qlist: await res.json()});
   }
   
    title = (
      <div>
        <b>Work3 :</b> แบบทดสอบ ด้วย ReactJS
      </div>
    );
    footer = (
      <div>
        By xxxxxxxxxx-x xxxxxxxxxxxxx xxxxxxxxxxxxxx <br />
        College of Computing, Khon Kaen University
      </div>
    );
    constructor() {
      super();
    }
    render() {
        var p = <Menu app={this}/>
        if(this.state.status == 1){
          p=<QList list={this.state.qlist} app={this} /> ;
        }
        if(this.state.status == 2){
          p=<ShowScore app={this} /> ;
        }
        return (
          <div className="card">
            <div className="card-header">{this.title} </div>
            <div>Answers: {JSON.stringify(this.state.answers)}</div>  
            <div className="card-body">{p}</div>  
            <div className="card-footer">{this.footer} </div>
          </div>
        );
      }

  }
  const container = document.getElementById("myapp");
  const root = ReactDOM.createRoot(container);
  root.render(<App />);

  function Menu(props){
    return <div>
      <button onClick={()=>props.app.setState({status:1})}>
        เริ่มทำแบบทดสอบ
      </button>
    </div>;
}

function QList(props){
    var valid = props.app.state.valid;
    return <div>
     <div>{props.list.map((q,i)=><div key={i}><QBlock q={q} i={i} app={props.app}/></div>)}</div>
     <div>
     { (valid)?<button onClick={()=>props.app.checkAnswer()}>ตรวจคำตอบ</button>
      :<span>กรุณาตอบให้ครบ</span> }
     </div>
     </div>
  }



  function QBlock({i,q,app}){
    const handleChange =(event)=>{
      const name = event.target.name;
      const value = event.target.value;
      var answers = app.state.answers;
      answers[name]=value;
      app.setState({answers});
      app.validate(); // ตรวจว่าตอบครบ
    }

    return <div>{i+1}
      <span dangerouslySetInnerHTML={{__html:q.title}}></span>
หมายเหตุ: ถ้าใช้แบบนี้ <span>{q.title}</span> ถ้าใน title มี tag html หน้าเว็บจะแสดง code html
      <div>
        { q.options.map((p,pi)=><div key={pi}>
          <input  type="radio" 
             name={"q"+i}
             value={pi+1}
             onChange={handleChange}          
          /> {pi+1} {p}</div>
        ) }
      </div>
    </div>
  }

  function ShowScore({app}){
    return <div className="p-2">
      คุณได้คะแนน {app.state.score}
      <button onClick={()=>app.setState({status:0})}>ตกลง</button>
    </div>
  }





