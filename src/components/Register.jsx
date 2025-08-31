// import React, { useRef, useEffect, useState } from "react";
// import "./Register.css";

// const emptyMember = () => ({ name: "", regNo: "", email: "", phone: "" });

// export default function Register() {
//   const inputRefs = useRef([]);
//   const [teamName, setTeamName] = useState("");
//   const [members, setMembers] = useState([emptyMember(), emptyMember(), emptyMember(), emptyMember()]);
//   const [errors, setErrors] = useState({}); // general or per-field
//   const [submitting, setSubmitting] = useState(false);
//   const [teamCount, setTeamCount] = useState(null);

//   useEffect(() => {
//     if (inputRefs.current[0]) inputRefs.current[0].focus();
//     // fetch current team count
//     fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`)
//       .then(r => r.json())
//       .then(d => setTeamCount(d.count))
//       .catch(() => {});
//   }, []);

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const next = inputRefs.current[index + 1];
//       if (next) next.focus();
//     }
//   };

//   const updateMember = (idx, field, value) => {
//     const copy = members.slice();
//     copy[idx] = { ...copy[idx], [field]: value };
//     setMembers(copy);
//   };

//   const checkRegNo = async (regNo) => {
//     if (!regNo) return false;
//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-reg/${encodeURIComponent(regNo)}`);
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const handleBlurReg = async (idx) => {
//     const regNo = members[idx].regNo.trim();
//     if (!regNo) return;
//     const exists = await checkRegNo(regNo);
//     setErrors(prev => ({ ...prev, [`reg_${idx}`]: exists ? `Reg No ${regNo} already registered` : "" }));
//   };

//   const validateBeforeSend = () => {
//     const e = {};
//     if (!teamName.trim()) e.teamName = "Team name required";
//     const filledMembers = members.slice(0, 3); // first 3 must be filled
//     for (let i = 0; i < 3; i++) {
//       const m = filledMembers[i];
//       if (!m.name.trim()) e[`name_${i}`] = "Name required";
//       if (!m.regNo.trim()) e[`regNo_${i}`] = "Reg No required";
//       if (!m.email.trim()) e[`email_${i}`] = "Email required";
//       if (!/@klu\.ac\.in$/.test(m.email.trim())) e[`email_${i}`] = "Email must end with @klu.ac.in";
//       if (!m.phone.trim()) e[`phone_${i}`] = "Phone required";
//     }
//     return e;
//   };

//   const handleSubmit = async (ev) => {
//     ev.preventDefault();
//     setErrors({});
//     const e = validateBeforeSend();
//     if (Object.keys(e).length) {
//       setErrors(e);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     // check team limit client-side too
//     if (teamCount !== null && teamCount >= 40) {
//       setErrors({ general: "Registration closed: 40 teams already registered." });
//       return;
//     }

//     // check regNo existence (pre-check)
//     for (let i = 0; i < members.length; i++) {
//       const reg = members[i].regNo && members[i].regNo.trim();
//       if (!reg) continue;
//       const exists = await checkRegNo(reg);
//       if (exists) {
//         setErrors({ general: `Registration number ${reg} already exists.` });
//         return;
//       }
//     }

//     // prepare payload: only keep non-empty members, but ensure first 3 are included
//     const payloadMembers = members
//       .map(m => ({ name: m.name.trim(), regNo: m.regNo.trim(), email: m.email.trim(), phone: m.phone.trim() }))
//       .filter((m, idx) => {
//         if (idx < 3) return true;
//         // optional 4th: include only if any field present
//         return m.name || m.regNo || m.email || m.phone;
//       });

//     setSubmitting(true);
//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ teamName: teamName.trim(), members: payloadMembers })
//       });
//       const data = await res.json();
//       if (res.ok && data.success) {
//         alert("✅ Team Registered Successfully!");
//         // reset
//         setTeamName("");
//         setMembers([emptyMember(), emptyMember(), emptyMember(), emptyMember()]);
//         setErrors({});
//         // update team count
//         const cntRes = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`);
//         const cntData = await cntRes.json();
//         setTeamCount(cntData.count);
//       } else {
//         setErrors({ general: data.message || "Registration failed." });
//       }
//     } catch (err) {
//       setErrors({ general: "Server error. Try again later." });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="heist-bg">
//       <div className="heist-overlay" />
//       <header className="heist-header">
//         <div className="mask-badge" aria-hidden>🎭</div>
//         <h1 className="heist-title">HACKATHON HEIST</h1>
//         <p className="heist-sub">Register your crew. Plan the perfect build.</p>
//         {typeof teamCount === "number" && <div className="team-count">Teams registered: {teamCount} / 40</div>}
//       </header>

//       <div className="container heist-card">
//         <form className="form" onSubmit={handleSubmit} noValidate>
//           {errors.general && <div className="error-banner">{errors.general}</div>}

//           <div className="form-group">
//             <label>Team Name <span className="req">*</span></label>
//             <input
//               type="text"
//               placeholder="Enter team name"
//               required
//               value={teamName}
//               onChange={(e) => setTeamName(e.target.value)}
//               ref={(el) => (inputRefs.current[0] = el)}
//               onKeyDown={(e) => handleKeyDown(e, 0)}
//             />
//             {errors.teamName && <div className="field-error">{errors.teamName}</div>}
//           </div>

//           {members.map((member, idx) => (
//             <div key={idx} className="member-section">
//               <h3 className="member-title">
//                 Member {idx + 1} {idx < 3 ? <span className="req">*</span> : <span className="opt">(Optional)</span>}
//               </h3>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Name {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Enter name"
//                     required={idx < 3}
//                     value={member.name}
//                     onChange={(e) => updateMember(idx, "name", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 1] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 1)}
//                   />
//                   {errors[`name_${idx}`] && <div className="field-error">{errors[`name_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Reg No {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Registration No"
//                     required={idx < 3}
//                     value={member.regNo}
//                     onChange={(e) => updateMember(idx, "regNo", e.target.value)}
//                     onBlur={() => handleBlurReg(idx)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 2] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 2)}
//                   />
//                   {errors[`reg_${idx}`] && <div className="field-error">{errors[`reg_${idx}`]}</div>}
//                   {errors[`regNo_${idx}`] && <div className="field-error">{errors[`regNo_${idx}`]}</div>}
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Email {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="email"
//                     placeholder="Enter email"
//                     required={idx < 3}
//                     value={member.email}
//                     onChange={(e) => updateMember(idx, "email", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 3] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 3)}
//                   />
//                   {errors[`email_${idx}`] && <div className="field-error">{errors[`email_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Phone {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="tel"
//                     placeholder="Phone No"
//                     required={idx < 3}
//                     value={member.phone}
//                     onChange={(e) => updateMember(idx, "phone", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 4] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 4)}
//                   />
//                   {errors[`phone_${idx}`] && <div className="field-error">{errors[`phone_${idx}`]}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button type="submit" className="submit-btn" disabled={submitting}>
//             {submitting ? "Registering..." : "Register Team"}
//           </button>
//         </form>
//       </div>

//       <footer className="heist-footer">
//         <span>“No plan survives first contact—except a solid registration.”</span>
//       </footer>
//     </div>
//   );
// }


// import React, { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // ✅ Add this
// import "./Register.css";

// const emptyMember = () => ({ name: "", regNo: "", email: "", phone: "" });

// export default function Register() {
//   const inputRefs = useRef([]);
//   const navigate = useNavigate(); // ✅ Initialize navigate
//   const [teamName, setTeamName] = useState("");
//   const [members, setMembers] = useState([
//     emptyMember(),
//     emptyMember(),
//     emptyMember(),
//     emptyMember()
//   ]);
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [teamCount, setTeamCount] = useState(null);

//   useEffect(() => {
//     if (inputRefs.current[0]) inputRefs.current[0].focus();
//     fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`)
//       .then(r => r.json())
//       .then(d => setTeamCount(d.count))
//       .catch(() => {});
//   }, []);

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const next = inputRefs.current[index + 1];
//       if (next) next.focus();
//     }
//   };

//   const updateMember = (idx, field, value) => {
//     const copy = members.slice();
//     copy[idx] = { ...copy[idx], [field]: value };
//     setMembers(copy);
//   };

//   const checkRegNo = async (regNo) => {
//     if (!regNo) return false;
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-reg/${encodeURIComponent(regNo)}`
//       );
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const handleBlurReg = async (idx) => {
//     const regNo = members[idx].regNo.trim();
//     if (!regNo) return;
//     const exists = await checkRegNo(regNo);
//     setErrors(prev => ({
//       ...prev,
//       [`reg_${idx}`]: exists ? `Reg No ${regNo} already registered` : ""
//     }));
//   };

//   const validateBeforeSend = () => {
//     const e = {};
//     if (!teamName.trim()) e.teamName = "Team name required";
//     const filledMembers = members.slice(0, 3);
//     for (let i = 0; i < 3; i++) {
//       const m = filledMembers[i];
//       if (!m.name.trim()) e[`name_${i}`] = "Name required";
//       if (!m.regNo.trim()) e[`regNo_${i}`] = "Reg No required";
//       if (!m.email.trim()) e[`email_${i}`] = "Email required";
//       if (!/@klu\.ac\.in$/.test(m.email.trim())) e[`email_${i}`] = "Email must end with @klu.ac.in";
//       if (!m.phone.trim()) e[`phone_${i}`] = "Phone required";
//     }
//     return e;
//   };

//   const handleSubmit = async (ev) => {
//     ev.preventDefault();
//     setErrors({});
//     const e = validateBeforeSend();
//     if (Object.keys(e).length) {
//       setErrors(e);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     if (teamCount !== null && teamCount >= 40) {
//       setErrors({ general: "Registration closed: 40 teams already registered." });
//       return;
//     }

//     for (let i = 0; i < members.length; i++) {
//       const reg = members[i].regNo && members[i].regNo.trim();
//       if (!reg) continue;
//       const exists = await checkRegNo(reg);
//       if (exists) {
//         setErrors({ general: `Registration number ${reg} already exists.` });
//         return;
//       }
//     }

//     const payloadMembers = members
//       .map(m => ({
//         name: m.name.trim(),
//         regNo: m.regNo.trim(),
//         email: m.email.trim(),
//         phone: m.phone.trim()
//       }))
//       .filter((m, idx) => {
//         if (idx < 3) return true;
//         return m.name || m.regNo || m.email || m.phone;
//       });

//     setSubmitting(true);
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ teamName: teamName.trim(), members: payloadMembers })
//         }
//       );
//       const data = await res.json();

//       if (res.ok && data.success) {
//         // ✅ Navigate to success page
//         navigate("/successfull");
//       } else {
//         setErrors({ general: data.message || "Registration failed." });
//       }
//     } catch (err) {
//       setErrors({ general: "Server error. Try again later." });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="heist-bg">
//       <div className="heist-overlay" />
//       <header className="heist-header">
//         <div className="mask-badge" aria-hidden>🎭</div>
//         <h1 className="heist-title">HACKATHON HEIST</h1>
//         <p className="heist-sub">Register your crew. Plan the perfect build.</p>
//         {typeof teamCount === "number" && (
//           <div className="team-count">Teams registered: {teamCount} / 40</div>
//         )}
//       </header>

//       <div className="container heist-card">
//         <form className="form" onSubmit={handleSubmit} noValidate>
//           {errors.general && <div className="error-banner">{errors.general}</div>}

//           <div className="form-group">
//             <label>Team Name <span className="req">*</span></label>
//             <input
//               type="text"
//               placeholder="Enter team name"
//               required
//               value={teamName}
//               onChange={(e) => setTeamName(e.target.value)}
//               ref={(el) => (inputRefs.current[0] = el)}
//               onKeyDown={(e) => handleKeyDown(e, 0)}
//             />
//             {errors.teamName && <div className="field-error">{errors.teamName}</div>}
//           </div>

//           {members.map((member, idx) => (
//             <div key={idx} className="member-section">
//               <h3 className="member-title">
//                 Member {idx + 1} {idx < 3 ? <span className="req">*</span> : <span className="opt">(Optional)</span>}
//               </h3>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Name {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Enter name"
//                     required={idx < 3}
//                     value={member.name}
//                     onChange={(e) => updateMember(idx, "name", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 1] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 1)}
//                   />
//                   {errors[`name_${idx}`] && <div className="field-error">{errors[`name_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Reg No {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Registration No"
//                     required={idx < 3}
//                     value={member.regNo}
//                     onChange={(e) => updateMember(idx, "regNo", e.target.value)}
//                     onBlur={() => handleBlurReg(idx)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 2] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 2)}
//                   />
//                   {errors[`reg_${idx}`] && <div className="field-error">{errors[`reg_${idx}`]}</div>}
//                   {errors[`regNo_${idx}`] && <div className="field-error">{errors[`regNo_${idx}`]}</div>}
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Email {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="email"
//                     placeholder="Enter email"
//                     required={idx < 3}
//                     value={member.email}
//                     onChange={(e) => updateMember(idx, "email", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 3] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 3)}
//                   />
//                   {errors[`email_${idx}`] && <div className="field-error">{errors[`email_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Phone {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="tel"
//                     placeholder="Phone No"
//                     required={idx < 3}
//                     value={member.phone}
//                     onChange={(e) => updateMember(idx, "phone", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 4] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 4)}
//                   />
//                   {errors[`phone_${idx}`] && <div className="field-error">{errors[`phone_${idx}`]}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button type="submit" className="submit-btn" disabled={submitting}>
//             {submitting ? "Registering..." : "Register Team"}
//           </button>
//         </form>
//       </div>

//       <footer className="heist-footer">
//         <span>“No plan survives first contact—except a solid registration.”</span>
//       </footer>
//     </div>
//   );
// }


// import React, { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Register.css";

// const emptyMember = () => ({ name: "", regNo: "", email: "", phone: "" });

// export default function Register() {
//   const inputRefs = useRef([]);
//   const navigate = useNavigate();
//   const [teamName, setTeamName] = useState("");
//   const [members, setMembers] = useState([
//     emptyMember(),
//     emptyMember(),
//     emptyMember(),
//     emptyMember()
//   ]);
//   const [errors, setErrors] = useState({});
//   const [formErrors, setFormErrors] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [teamCount, setTeamCount] = useState(null);

//   useEffect(() => {
//     if (inputRefs.current[0]) inputRefs.current[0].focus();
//     fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`)
//       .then(r => r.json())
//       .then(d => setTeamCount(d.count))
//       .catch(() => {});
//   }, []);

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const next = inputRefs.current[index + 1];
//       if (next) next.focus();
//     }
//   };

//   const updateMember = (idx, field, value) => {
//     const copy = members.slice();
//     copy[idx] = { ...copy[idx], [field]: value };
//     setMembers(copy);
//   };

//   const checkRegNo = async (regNo) => {
//     if (!regNo) return false;
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-reg/${encodeURIComponent(regNo)}`
//       );
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const checkTeamName = async (team) => {
//     if (!team) return false;
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-team/${encodeURIComponent(team)}`
//       );
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const handleBlurReg = async (idx) => {
//     const regNo = members[idx].regNo.trim();
//     if (!regNo) return;
//     const exists = await checkRegNo(regNo);
//     setErrors(prev => ({
//       ...prev,
//       [`reg_${idx}`]: exists ? `Registration number ${regNo} already registered` : ""
//     }));
//   };

//   const handleBlurTeam = async () => {
//     if (!teamName.trim()) return;
//     const exists = await checkTeamName(teamName.trim());
//     setErrors(prev => ({
//       ...prev,
//       teamName: exists ? "Team name already registered" : ""
//     }));
//   };

//   const validateBeforeSend = () => {
//     const e = {};
//     if (!teamName.trim()) e.teamName = "Team name required";

//     const filledMembers = members.slice(0, 3);
//     for (let i = 0; i < 3; i++) {
//       const m = filledMembers[i];
//       if (!m.name.trim()) e[`name_${i}`] = "Name required";
//       if (!m.regNo.trim()) e[`regNo_${i}`] = "Registration No required";
//       if (!m.email.trim()) e[`email_${i}`] = "Email required";
//       if (!/@klu\.ac\.in$/.test(m.email.trim()))
//         e[`email_${i}`] = "Email must end with @klu.ac.in";
//       if (!m.phone.trim()) e[`phone_${i}`] = "Phone required";
//     }
//     return e;
//   };

//   const handleSubmit = async (ev) => {
//     ev.preventDefault();
//     setErrors({});
//     setFormErrors([]);

//     const e = validateBeforeSend();
//     if (Object.keys(e).length) {
//       setErrors(e);
//       setFormErrors(Object.values(e));
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     if (teamCount !== null && teamCount >= 40) {
//       const msg = "Registration closed: 40 teams already registered.";
//       setErrors({ general: msg });
//       setFormErrors([msg]);
//       return;
//     }

//     const confirmSubmit = window.confirm("Are you sure you want to submit?");
//     if (!confirmSubmit) return;

//     const teamExists = await checkTeamName(teamName.trim());
//     if (teamExists) {
//       const msg = "Team name already registered";
//       setErrors({ teamName: msg });
//       setFormErrors([msg]);
//       return;
//     }

//     for (let i = 0; i < members.length; i++) {
//       const reg = members[i].regNo && members[i].regNo.trim();
//       if (!reg) continue;
//       const exists = await checkRegNo(reg);
//       if (exists) {
//         const msg = `Registration number ${reg} already exists.`;
//         setErrors({ [`reg_${i}`]: msg });
//         setFormErrors([msg]);
//         return;
//       }
//     }

//     const payloadMembers = members
//       .map(m => ({
//         name: m.name.trim(),
//         regNo: m.regNo.trim(),
//         email: m.email.trim(),
//         phone: m.phone.trim()
//       }))
//       .filter((m, idx) => {
//         if (idx < 3) return true;
//         return m.name || m.regNo || m.email || m.phone;
//       });

//     setSubmitting(true);
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ teamName: teamName.trim(), members: payloadMembers })
//         }
//       );
//       const data = await res.json();

//       if (res.ok && data.success) {
//         navigate("/successfull");
//       } else {
//         const msg = data.message || "Registration failed.";
//         setErrors({ general: msg });
//         setFormErrors([msg]);
//       }
//     } catch (err) {
//       const msg = "Server error. Try again later.";
//       setErrors({ general: msg });
//       setFormErrors([msg]);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="heist-bg">
//       <div className="heist-overlay" />
//       <header className="heist-header">
//         <div className="mask-badge" aria-hidden>🎭</div>
//         <h1 className="heist-title">HACKATHON HEIST</h1>
//         <p className="heist-sub">Register your crew. Plan the perfect build.</p>
//         {typeof teamCount === "number" && (
//           <div className="team-count">Teams registered: {teamCount} / 40</div>
//         )}
//       </header>

//       <div className="container heist-card">
//         <form className="form" onSubmit={handleSubmit} noValidate>
//           <div className="form-group">
//             <label>Team Name <span className="req">*</span></label>
//             <input
//               type="text"
//               placeholder="Enter team name"
//               required
//               value={teamName}
//               onBlur={handleBlurTeam}
//               onChange={(e) => setTeamName(e.target.value)}
//               ref={(el) => (inputRefs.current[0] = el)}
//               onKeyDown={(e) => handleKeyDown(e, 0)}
//             />
//             {errors.teamName && <div className="field-error">{errors.teamName}</div>}
//           </div>

//           {members.map((member, idx) => (
//             <div key={idx} className="member-section">
//               <h3 className="member-title">
//                 Member {idx + 1} {idx < 3 ? <span className="req">*</span> : <span className="opt">(Optional)</span>}
//               </h3>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Name {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Enter name"
//                     required={idx < 3}
//                     value={member.name}
//                     onChange={(e) => updateMember(idx, "name", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 1] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 1)}
//                   />
//                   {errors[`name_${idx}`] && <div className="field-error">{errors[`name_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Reg No {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Registration No"
//                     required={idx < 3}
//                     value={member.regNo}
//                     onChange={(e) => updateMember(idx, "regNo", e.target.value)}
//                     onBlur={() => handleBlurReg(idx)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 2] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 2)}
//                   />
//                   {errors[`reg_${idx}`] && <div className="field-error">{errors[`reg_${idx}`]}</div>}
//                   {errors[`regNo_${idx}`] && <div className="field-error">{errors[`regNo_${idx}`]}</div>}
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Email {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="email"
//                     placeholder="Enter email"
//                     required={idx < 3}
//                     value={member.email}
//                     onChange={(e) => updateMember(idx, "email", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 3] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 3)}
//                   />
//                   {errors[`email_${idx}`] && <div className="field-error">{errors[`email_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Phone {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="tel"
//                     placeholder="Phone No"
//                     required={idx < 3}
//                     value={member.phone}
//                     onChange={(e) => updateMember(idx, "phone", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 4] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 4)}
//                   />
//                   {errors[`phone_${idx}`] && <div className="field-error">{errors[`phone_${idx}`]}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Submit Button */}
//           <button type="submit" className="submit-btn" disabled={submitting}>
//             {submitting ? "Registering..." : "Register Team"}
//           </button>

//           {/* Global Error Summary */}
//           {formErrors.length > 0 && (
//             <div className="error-summary">
//               <h4>⚠ Please fix the following errors:</h4>
//               <ul>
//                 {formErrors.map((err, idx) => (
//                   <li key={idx}>{err}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </form>
//       </div>

//       <footer className="heist-footer">
//         <span>“No plan survives first contact—except a solid registration.”</span>
//       </footer>
//     </div>
//   );
// }


// import React, { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Register.css";

// const emptyMember = () => ({ name: "", regNo: "", email: "", phone: "" });

// export default function Register() {
//   const inputRefs = useRef([]);
//   const navigate = useNavigate();
//   const [teamName, setTeamName] = useState("");
//   const [members, setMembers] = useState([
//     emptyMember(),
//     emptyMember(),
//     emptyMember(),
//     emptyMember()
//   ]);
//   const [errors, setErrors] = useState({});
//   const [formErrors, setFormErrors] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [teamCount, setTeamCount] = useState(null);

//   useEffect(() => {
//     if (inputRefs.current[0]) inputRefs.current[0].focus();
//     fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`)
//       .then(r => r.json())
//       .then(d => setTeamCount(d.count))
//       .catch(() => {});
//   }, []);

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const next = inputRefs.current[index + 1];
//       if (next) next.focus();
//     }
//   };

//   const updateMember = (idx, field, value) => {
//     const copy = members.slice();
//     copy[idx] = { ...copy[idx], [field]: value };
//     setMembers(copy);
//   };

//   const checkRegNo = async (regNo) => {
//     if (!regNo) return false;
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-reg/${encodeURIComponent(regNo)}`
//       );
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const checkTeamName = async (team) => {
//     if (!team) return false;
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-team/${encodeURIComponent(team)}`
//       );
//       const data = await res.json();
//       return data.exists;
//     } catch {
//       return false;
//     }
//   };

//   const handleBlurReg = async (idx) => {
//     const regNo = members[idx].regNo.trim();
//     if (!regNo) return;
//     const exists = await checkRegNo(regNo);
//     setErrors(prev => ({
//       ...prev,
//       [`reg_${idx}`]: exists ? `Registration number ${regNo} already registered` : ""
//     }));
//   };

//   const handleBlurTeam = async () => {
//     if (!teamName.trim()) return;
//     const exists = await checkTeamName(teamName.trim());
//     setErrors(prev => ({
//       ...prev,
//       teamName: exists ? "Team name already registered" : ""
//     }));
//   };

//   const validateBeforeSend = () => {
//     const e = {};
//     if (!teamName.trim()) e.teamName = "Team name required";

//     const filledMembers = members.slice(0, 3);
//     const regNos = new Set();

//     for (let i = 0; i < 3; i++) {
//       const m = filledMembers[i];

//       // Name check
//       if (!m.name.trim()) e[`name_${i}`] = "Name required";

//       // Registration number required & uniqueness within team
//       if (!m.regNo.trim()) {
//         e[`regNo_${i}`] = "Registration No required";
//       } else if (regNos.has(m.regNo.trim())) {
//         e[`regNo_${i}`] = `Duplicate Reg No: ${m.regNo}`;
//       } else {
//         regNos.add(m.regNo.trim());
//       }

//       // Email validation
//       if (!m.email.trim()) e[`email_${i}`] = "Email required";
//       else if (!/@klu\.ac\.in$/.test(m.email.trim()))
//         e[`email_${i}`] = "Email must end with @klu.ac.in";

//       // Phone validation → must be exactly 10 digits
//       if (!m.phone.trim()) {
//         e[`phone_${i}`] = "Phone required";
//       } else if (!/^\d{10}$/.test(m.phone.trim())) {
//         e[`phone_${i}`] = "Phone must be 10 digits";
//       }
//     }
//     return e;
//   };

//   const handleSubmit = async (ev) => {
//     ev.preventDefault();
//     setErrors({});
//     setFormErrors([]);

//     const e = validateBeforeSend();
//     if (Object.keys(e).length) {
//       setErrors(e);
//       setFormErrors(Object.values(e));
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     if (teamCount !== null && teamCount >= 40) {
//       const msg = "Registration closed: 40 teams already registered.";
//       setErrors({ general: msg });
//       setFormErrors([msg]);
//       return;
//     }

//     const confirmSubmit = window.confirm("Are you sure you want to submit?");
//     if (!confirmSubmit) return;

//     const teamExists = await checkTeamName(teamName.trim());
//     if (teamExists) {
//       const msg = "Team name already registered";
//       setErrors({ teamName: msg });
//       setFormErrors([msg]);
//       return;
//     }

//     for (let i = 0; i < members.length; i++) {
//       const reg = members[i].regNo && members[i].regNo.trim();
//       if (!reg) continue;
//       const exists = await checkRegNo(reg);
//       if (exists) {
//         const msg = `Registration number ${reg} already exists.`;
//         setErrors({ [`reg_${i}`]: msg });
//         setFormErrors([msg]);
//         return;
//       }
//     }

//     const payloadMembers = members
//       .map(m => ({
//         name: m.name.trim(),
//         regNo: m.regNo.trim(),
//         email: m.email.trim(),
//         phone: m.phone.trim()
//       }))
//       .filter((m, idx) => {
//         if (idx < 3) return true;
//         return m.name || m.regNo || m.email || m.phone;
//       });

//     setSubmitting(true);
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ teamName: teamName.trim(), members: payloadMembers })
//         }
//       );
//       const data = await res.json();

//       if (res.ok && data.success) {
//         navigate("/successfull");
//       } else {
//         const msg = data.message || "Registration failed.";
//         setErrors({ general: msg });
//         setFormErrors([msg]);
//       }
//     } catch (err) {
//       const msg = "Server error. Try again later.";
//       setErrors({ general: msg });
//       setFormErrors([msg]);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="heist-bg">
//       <div className="heist-overlay" />
//       <header className="heist-header">
//         <div className="mask-badge" aria-hidden>🎭</div>
//         <h1 className="heist-title">HACKATHON HEIST</h1>
//         <p className="heist-sub">Register your crew. Plan the perfect build.</p>
//         {typeof teamCount === "number" && (
//           <div className="team-count">Teams registered: {teamCount} / 40</div>
//         )}
//       </header>

//       <div className="container heist-card">
//         <form className="form" onSubmit={handleSubmit} noValidate>
//           <div className="form-group">
//             <label>Team Name <span className="req">*</span></label>
//             <input
//               type="text"
//               placeholder="Enter team name"
//               required
//               value={teamName}
//               onBlur={handleBlurTeam}
//               onChange={(e) => setTeamName(e.target.value)}
//               ref={(el) => (inputRefs.current[0] = el)}
//               onKeyDown={(e) => handleKeyDown(e, 0)}
//             />
//             {errors.teamName && <div className="field-error">{errors.teamName}</div>}
//           </div>

//           {members.map((member, idx) => (
//             <div key={idx} className="member-section">
//               <h3 className="member-title">
//                 Member {idx + 1} {idx < 3 ? <span className="req">*</span> : <span className="opt">(Optional)</span>}
//               </h3>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Name {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Enter name"
//                     required={idx < 3}
//                     value={member.name}
//                     onChange={(e) => updateMember(idx, "name", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 1] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 1)}
//                   />
//                   {errors[`name_${idx}`] && <div className="field-error">{errors[`name_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Reg No {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="text"
//                     placeholder="Registration No"
//                     required={idx < 3}
//                     value={member.regNo}
//                     onChange={(e) => updateMember(idx, "regNo", e.target.value)}
//                     onBlur={() => handleBlurReg(idx)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 2] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 2)}
//                   />
//                   {errors[`reg_${idx}`] && <div className="field-error">{errors[`reg_${idx}`]}</div>}
//                   {errors[`regNo_${idx}`] && <div className="field-error">{errors[`regNo_${idx}`]}</div>}
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Email {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="email"
//                     placeholder="Enter email"
//                     required={idx < 3}
//                     value={member.email}
//                     onChange={(e) => updateMember(idx, "email", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 3] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 3)}
//                   />
//                   {errors[`email_${idx}`] && <div className="field-error">{errors[`email_${idx}`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>Phone {idx < 3 && <span className="req">*</span>}</label>
//                   <input
//                     type="tel"
//                     placeholder="Phone No"
//                     required={idx < 3}
//                     value={member.phone}
//                     onChange={(e) => updateMember(idx, "phone", e.target.value)}
//                     ref={(el) => (inputRefs.current[idx * 4 + 4] = el)}
//                     onKeyDown={(e) => handleKeyDown(e, idx * 4 + 4)}
//                   />
//                   {errors[`phone_${idx}`] && <div className="field-error">{errors[`phone_${idx}`]}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Submit Button */}
//           <button type="submit" className="submit-btn" disabled={submitting}>
//             {submitting ? "Registering..." : "Register Team"}
//           </button>

//           {/* Global Error Summary */}
//           {formErrors.length > 0 && (
//             <div className="error-summary">
//               <h4>⚠ Please fix the following errors:</h4>
//               <ul>
//                 {formErrors.map((err, idx) => (
//                   <li key={idx}>{err}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </form>
//       </div>

//       <footer className="heist-footer">
//         <span>“No plan survives first contact—except a solid registration.”</span>
//       </footer>
//     </div>
//   );
// }

import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const emptyMember = () => ({
  name: "",
  regNo: "",
  email: "",
  phone: "",
  year: "",
  department: "",
  status: "", // updated
});

export default function Register() {
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([
    emptyMember(),
    emptyMember(),
    emptyMember(),
    emptyMember(),
  ]);
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [teamCount, setTeamCount] = useState(null);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/count`
    )
      .then((r) => r.json())
      .then((d) => setTeamCount(d.count))
      .catch(() => {});
  }, []);

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const updateMember = (idx, field, value) => {
    const copy = members.slice();
    copy[idx] = { ...copy[idx], [field]: value };
    setMembers(copy);
  };

  const checkRegNo = async (regNo) => {
    if (!regNo) return false;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-reg/${encodeURIComponent(
          regNo
        )}`
      );
      const data = await res.json();
      return data.exists;
    } catch {
      return false;
    }
  };

  const checkTeamName = async (team) => {
    if (!team) return false;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register/check-team/${encodeURIComponent(
          team
        )}`
      );
      const data = await res.json();
      return data.exists;
    } catch {
      return false;
    }
  };

  const handleBlurReg = async (idx) => {
    const regNo = members[idx].regNo.trim();
    if (!regNo) return;
    const exists = await checkRegNo(regNo);
    setErrors((prev) => ({
      ...prev,
      [`reg_${idx}`]: exists
        ? `Registration number ${regNo} already registered`
        : "",
    }));
  };

  const handleBlurTeam = async () => {
    if (!teamName.trim()) return;
    const exists = await checkTeamName(teamName.trim());
    setErrors((prev) => ({
      ...prev,
      teamName: exists ? "Team name already registered" : "",
    }));
  };

  const validateBeforeSend = () => {
    const e = {};
    if (!teamName.trim()) e.teamName = "Team name required";

    const filledMembers = members.slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const m = filledMembers[i];
      if (!m.name.trim()) e[`name_${i}`] = "Name required";
      if (!m.regNo.trim()) e[`regNo_${i}`] = "Registration No required";
      if (!m.email.trim()) e[`email_${i}`] = "Email required";
      if (!/@klu\.ac\.in$/.test(m.email.trim()))
        e[`email_${i}`] = "Email must end with @klu.ac.in";
      if (!m.phone.trim()) e[`phone_${i}`] = "Phone required";
      if (!/^\d{10}$/.test(m.phone.trim()))
        e[`phone_${i}`] = "Phone must be 10 digits";
      if (!m.year) e[`year_${i}`] = "Year required";
      if (!m.department?.trim()) e[`department_${i}`] = "Department required";
      if (!m.status) e[`status_${i}`] = "Select Hosteler / Dayscholar";
    }

    // Internal duplicate regNo
    const regSet = new Set();
    filledMembers.forEach((m, i) => {
      if (regSet.has(m.regNo)) e[`reg_${i}`] = `Duplicate Registration No ${m.regNo}`;
      else regSet.add(m.regNo);
    });

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrors({});
    setFormErrors([]);

    const e = validateBeforeSend();
    if (Object.keys(e).length) {
      setErrors(e);
      setFormErrors(Object.values(e));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (teamCount !== null && teamCount >= 40) {
      const msg = "Registration closed: 40 teams already registered.";
      setErrors({ general: msg });
      setFormErrors([msg]);
      return;
    }

    const confirmSubmit = window.confirm("Are you sure you want to submit?");
    if (!confirmSubmit) return;

    const teamExists = await checkTeamName(teamName.trim());
    if (teamExists) {
      const msg = "Team name already registered";
      setErrors({ teamName: msg });
      setFormErrors([msg]);
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const reg = members[i].regNo && members[i].regNo.trim();
      if (!reg) continue;
      const exists = await checkRegNo(reg);
      if (exists) {
        const msg = `Registration number ${reg} already exists.`;
        setErrors({ [`reg_${i}`]: msg });
        setFormErrors([msg]);
        return;
      }
    }

    const payloadMembers = members
      .map((m) => ({
        name: m.name.trim(),
        regNo: m.regNo.trim(),
        email: m.email.trim(),
        phone: m.phone.trim(),
        year: m.year,
        department: m.department.trim(),
        status: m.status,
      }))
      .filter((m, idx) => {
        if (idx < 3) return true;
        return m.name || m.regNo || m.email || m.phone;
      });

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamName: teamName.trim(), members: payloadMembers }),
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        navigate("/successfull");
      } else {
        const msg = data.message || "Registration failed.";
        setErrors({ general: msg });
        setFormErrors([msg]);
      }
    } catch (err) {
      const msg = "Server error. Try again later.";
      setErrors({ general: msg });
      setFormErrors([msg]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="heist-bg">
      <div className="heist-overlay" />
      <header className="heist-header">
        <div className="mask-badge" aria-hidden>
          🎭
        </div>
        <h1 className="heist-title">HACKATHON HEIST</h1>
        <p className="heist-sub">Register your crew. Plan the perfect build.</p>
        {typeof teamCount === "number" && (
          <div className="team-count">Teams registered: {teamCount} / 40</div>
        )}
      </header>

      <div className="container heist-card">
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>
              Team Name <span className="req">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter team name"
              required
              value={teamName}
              onBlur={handleBlurTeam}
              onChange={(e) => setTeamName(e.target.value)}
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
            {errors.teamName && <div className="field-error">{errors.teamName}</div>}
          </div>

          {members.map((member, idx) => (
            <div key={idx} className="member-section">
              <h3 className="member-title">
                Member {idx + 1} {idx < 3 ? <span className="req">*</span> : <span className="opt">(Optional)</span>}
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Name {idx < 3 && <span className="req">*</span>}</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    required={idx < 3}
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                    ref={(el) => (inputRefs.current[idx * 7 + 1] = el)}
                    onKeyDown={(e) => handleKeyDown(e, idx * 7 + 1)}
                  />
                  {errors[`name_${idx}`] && <div className="field-error">{errors[`name_${idx}`]}</div>}
                </div>

                <div className="form-group">
                  <label>Reg No {idx < 3 && <span className="req">*</span>}</label>
                  <input
                    type="text"
                    placeholder="Registration No"
                    required={idx < 3}
                    value={member.regNo}
                    onChange={(e) => updateMember(idx, "regNo", e.target.value)}
                    onBlur={() => handleBlurReg(idx)}
                    ref={(el) => (inputRefs.current[idx * 7 + 2] = el)}
                    onKeyDown={(e) => handleKeyDown(e, idx * 7 + 2)}
                  />
                  {errors[`reg_${idx}`] && <div className="field-error">{errors[`reg_${idx}`]}</div>}
                  {errors[`regNo_${idx}`] && <div className="field-error">{errors[`regNo_${idx}`]}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email {idx < 3 && <span className="req">*</span>}</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    required={idx < 3}
                    value={member.email}
                    onChange={(e) => updateMember(idx, "email", e.target.value)}
                    ref={(el) => (inputRefs.current[idx * 7 + 3] = el)}
                    onKeyDown={(e) => handleKeyDown(e, idx * 7 + 3)}
                  />
                  {errors[`email_${idx}`] && <div className="field-error">{errors[`email_${idx}`]}</div>}
                </div>

                <div className="form-group">
                  <label>Phone {idx < 3 && <span className="req">*</span>}</label>
                  <input
                    type="tel"
                    placeholder="Phone No"
                    required={idx < 3}
                    value={member.phone}
                    onChange={(e) => updateMember(idx, "phone", e.target.value)}
                    ref={(el) => (inputRefs.current[idx * 7 + 4] = el)}
                    onKeyDown={(e) => handleKeyDown(e, idx * 7 + 4)}
                  />
                  {errors[`phone_${idx}`] && <div className="field-error">{errors[`phone_${idx}`]}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year <span className="req">*</span></label>
                  <div className="radio-group">
                    {["2nd Year", "3rd Year", "4th Year"].map((yr) => (
                      <label key={yr}>
                        <input
                          type="radio"
                          name={`year_${idx}`}
                          value={yr}
                          checked={member.year === yr}
                          onChange={(e) => updateMember(idx, "year", e.target.value)}
                        />
                        {yr}
                      </label>
                    ))}
                  </div>
                  {errors[`year_${idx}`] && <div className="field-error">{errors[`year_${idx}`]}</div>}
                </div>

                <div className="form-group">
                  <label>Department <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter department"
                    value={member.department}
                    onChange={(e) => updateMember(idx, "department", e.target.value)}
                  />
                  {errors[`department_${idx}`] && <div className="field-error">{errors[`department_${idx}`]}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Hosteler / Dayscholar <span className="req">*</span></label>
                <select
                  value={member.status}
                  onChange={(e) => updateMember(idx, "status", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Hosteler">Hosteler</option>
                  <option value="Dayscholar">Dayscholar</option>
                </select>
                {errors[`status_${idx}`] && <div className="field-error">{errors[`status_${idx}`]}</div>}
              </div>
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Registering..." : "Register Team"}
          </button>

          {formErrors.length > 0 && (
            <div className="error-summary">
              <h4>⚠ Please fix the following errors:</h4>
              <ul>
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>

      <footer className="heist-footer">
        <span>“No plan survives first contact—except a solid registration.”</span>
      </footer>
    </div>
  );
}
