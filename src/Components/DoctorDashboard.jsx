import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useRef } from 'react';


const DoctorDashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user.id;
  const [appointments, setAppointments] = useState([]);

  const getAppointments = () => {
    axios.get("https://18ed-103-156-19-229.ngrok-free.app/doctor/appointments", { params: { doctorId: doctorId } })
      .then((res) => {
        console.log(res.data);
        setAppointments(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  let localVideoRef = useRef();
  let remoteVideoRef = useRef();


  useEffect(() => {
    setTimeout(getAppointments, 2000);

    let conn = new WebSocket("ws://8059-103-156-19-229.ngrok-free.app/socket");
    console.log(conn);

    var configuration = {
      iceServers: [{
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ]
      }]
    };

    var peerConnection = new RTCPeerConnection(configuration);

    console.log(peerConnection.connectionState);


    conn.onmessage = async (event) => {

      console.log(JSON.parse(event.data));
      const data = JSON.parse(event.data);

      if (data.description) {
        await peerConnection.setRemoteDescription(data.description);
        if (data.description.type === "offer") {
          console.log("Data.descritpion type: ", data.description.type)
          await peerConnection.setLocalDescription(await peerConnection.createAnswer());
          conn.send(JSON.stringify({ description: peerConnection.localDescription }));
        }
      }
      

    }

    peerConnection.onnegotiationneeded = async (event) => {

      console.log("negotiation event: ", event);
      await peerConnection.setLocalDescription(await peerConnection.createOffer());
      console.log(peerConnection.localDescription.toJSON());
      conn.send(JSON.stringify({ description: peerConnection.localDescription }));
      
    }


    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      console.log(stream);
      localVideoRef.current.srcObject = stream;
      for (const track of stream.getTracks()) {
        peerConnection.addTrack(track, stream);
      }
    })

    peerConnection.ontrack = ({ streams }) => {
      console.log("streams: ", streams);
      remoteVideoRef.current.srcObject = streams[0];
    }



    peerConnection.onicecandidate = (event) => {
      console.log(event);
      if(event.candidate){
        const candidate = event.candidate;
        conn.send(JSON.stringify({candidate}));
      }
    }



  }, [])





  return (
    <div>
      <div>Hi! {user["name"]}. This is your dashboard</div>
      {
        appointments.length === 0
          ?
          <div>You have No Appointments</div>
          :
          <div>
            Here are your Appointments

            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Meeting Link</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((meeting, index) => (
                  <tr key={index}>
                    <td>{meeting.patient.id}</td>
                    <td><Link to='/video-call-patient' state={{ caller: doctorId, callee: meeting.patient.id }} >Click here to Join</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>


          </div>}

      <div>
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
    </div>
  )
}

export default DoctorDashboard