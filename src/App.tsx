import React, {Dispatch, KeyboardEvent, useRef, useState} from 'react';
import './App.css';
import {Alert, Button, Col, InputNumber, Layout, Menu, Row} from "antd";
import _ from "lodash";
import {SettingOutlined} from '@ant-design/icons';

function Body(props:{origin:string, dest:string, setDest:Dispatch<string>}) {
  const defaultResultMsg = "이곳에 결과가 표시 됩니다.";
  const [result, setResult] = useState(defaultResultMsg);
  const [msg, setMsg] = useState("확인하려면 변경 버튼을 눌러주세요.");
  const [from, setFrom] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const progress:{num:string, power:number}[] = [];
  const baseNProcess:{num:string, value:number, remainder:number}[] = [];

  const onChange = (val:number) => {
    setFrom(val);
  }

  const onKeyPress = (e:KeyboardEvent<HTMLInputElement>) => {
    const {charCode, code} = e;
    if (charCode === 13 || code === "Enter") {
      convert();
    }
  }

  const _check = (val:string[]):boolean => {
    for(let v of val) {
      if (Number(v) >= Number(props.origin)) {
        return false;
      }
    }
    return true;
  }

  const _calcToNaturalNumber = (type:string): number => {
    if (!from) {
      setMsg("수를 입력하세요.");
      if(input && input.current) input.current.focus();
      setResult(defaultResultMsg);
      return -1;
    }

    const val = from.toString().split("");
    if (!_check(val)) {
      setMsg(`${props.origin}진수의 범위를 초과했습니다.\n0~${Number(props.origin)-1}까지의 숫자만 입력하세요.`);
      if(input && input.current) input.current.focus();
      setResult(defaultResultMsg);
      return -1;
    }

    const naturalNumber = Number(_.reduce(_.reverse(val), (sum, n, idx) => {
      const unit = Math.pow(parseInt(props.origin), idx);
      if (props.origin !== "10") {
        if (idx === 1) {
          progress.push({num: sum, power: 0});
        }
        progress.push({num: n, power: idx});
      }
      const result = parseInt(sum) + parseInt(n)*unit;
      return result.toString();
    }));
    return naturalNumber;
  }

  const _calcToBaseN = (naturalNumber:number): any => {
    const baseN = Number(props.dest);
    let result = "";
    do {
      result = (naturalNumber % baseN) + result;
      naturalNumber = Math.floor(naturalNumber / baseN);
    } while (naturalNumber > 0);
    return result;
  }

  const _baseNProcess = (naturalNumber:number):string => {
    return `\n-> ${naturalNumber}\n\n이 10진수 ${naturalNumber}(을)를 ${props.dest}진수로 바꾼다.\n${baseNProcess}`;
  }

  const delay = (time:number) => {
    return new Promise((res:any)=>{
      setTimeout(() => {res();}, time);
    })
  }

  const convert = async () => {
    setMsg("");
    await delay(300);
    const naturalNumber = _calcToNaturalNumber(props.origin);
    if (naturalNumber < 0) return false;
    const res = (props.dest === "10") ? naturalNumber : _calcToBaseN(naturalNumber);

    const process = _.map(_.reverse(progress), (v) => {
      return `${v.num}^${v.power}`;
    });
    _.map(progress, () => progress.pop());
    const prefix = (props.origin === "10" || props.dest === "10") ? '' : `일단 ${props.origin}진수를 10진수로 바꾼다.\n`;
    const after = (props.dest === "10") ? '' : _baseNProcess(naturalNumber);

    setResult(`${props.origin}진수 ${from}을 ${props.dest}진수로 변경하면\n\n${prefix}${process.join('||')}${after}\n\n-> ${res}`);
  }

  const nl2br = (str:string) => {
    const _convertSup = (s:string) => {
      const processArr = s.split('||');
      if (processArr[1]) {
        return _.map(processArr, (v,k) => {
          const [num, power] = v.split('^');
          const plus = (k === processArr.length - 1) ? '' : ' + ';
          return <span key={k}>({num} x {props.origin}<sup>{power}</sup>){plus}</span>
        })
      } else {
        return <div style={{minHeight: 30}}>{s}</div>;
      }
    }
    return _.map(str.split("\n"), (v,i)=>{
      return <div key={i}>{_convertSup(v)}</div>
    })
  }

  return (<div style={{padding:"10px"}}>
    <div style={{padding:10}}>{`${props.origin}진법을 ${props.dest}진법으로 바꿉니다.`}</div>
    <div>
      <Row>
        <Col span={8}>{props.origin}진수 입력</Col>
        <Col span={12} style={{textAlign:"left"}}>
          <InputNumber
            ref={input}
            min={0}
            onChange={onChange}
            onKeyPress={onKeyPress}
            style={{width:200, marginBottom:10}}
            type={"number"}
            pattern="[0-9]*"
            autoFocus={true}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24} style={{marginBottom: 10}}>
          <Button block={true} icon={<SettingOutlined />} type={"primary"} size={"large"} shape={"round"} onClick={convert}>변경</Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {msg && <Alert message={msg} type={"info"} />}
          <div style={{textAlign:"left", border:"1px solid #ddd", padding:10, background:"#fff"}}>{nl2br(result)}</div>
        </Col>
      </Row>
    </div>
  </div>)
}

function App() {
  const {Header, Footer, Content} = Layout;
  const [origin, setOrigin] = useState("2");
  const [dest, setDest] = useState("10");
  const entry = ["계산기를 선택하세요.", "2", "10", "4", "8"];
  return (
    <div className="App">
      <Layout>
        <Header>{origin}진법 변환기 ({`${origin}진법 -> ${dest}진법`})</Header>
        <Content>
          <Menu selectedKeys={[origin]} mode={"horizontal"}>
            {
              _.map(entry, (v:string,key:number)=>{
                const val = (key > 0) ? `${v}진법` : "원본선택 : ";
                return <Menu.Item key={v} onClick={() => setOrigin(v)} disabled={key === 0}>{val}</Menu.Item>
              })
            }
          </Menu>
          <Menu selectedKeys={[dest]} mode={"horizontal"}>
            {
              _.map(entry, (v:string,key:number)=>{
                const val = (key > 0) ? `${v}진법` : "대상선택 : ";
                return <Menu.Item key={v} onClick={() => setDest(v)} disabled={key === 0}>{val}</Menu.Item>
              })
            }
          </Menu>
          <Body origin={origin} dest={dest} setDest={setDest} />
        </Content>
        <Footer><a href={"https://blog.naver.com/hkjw1211"} target={"_blank"}>Copyright 2021. kyus.All rights reserved.</a></Footer>
      </Layout>
    </div>
  );
}

export default App;
