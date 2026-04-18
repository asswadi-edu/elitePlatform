import React, { useState, useContext, useRef } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiRobotDuotone, PiFileTextDuotone, PiLightningDuotone, PiInfoDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function DashGenerate({ setPage, pageData }) {
  const { t } = useContext(LanguageContext);
  const fileInputRef = useRef(null);
  const [subject, setSubject] = useState(pageData?.retest ? pageData.subject : '');
  const [retestMode, setRetestMode] = useState(pageData?.retest || false);
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState('20');
  const [timeLimit, setTimeLimit] = useState('20');
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('auto');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  async function generate() { 
    if (!subject) return alert(t("يرجى إدخال اسم المادة"));
    if (!retestMode && !selectedFile) return alert(t("يرجى اختيار ملف للدراسة"));

    setLoading(true); 
    try {
      const token = localStorage.getItem('elite_token');
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('num_questions', numQuestions);
      formData.append('time_limit', timeLimit);
      formData.append('difficulty', difficulty);
      formData.append('language', language);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`${getApiUrl()}/api/ai-quizzes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const quiz = await res.json();
        setPage('dash-quiz', { uuid: quiz.uuid });
      } else {
        const err = await res.json();
        alert(err.message || t("فشل توليد الاختبار"));
      }
    } catch (e) {
      console.error(e);
      alert(t("حدث خطأ أثناء الاتصال بالسيرفر"));
    } finally {
      setLoading(false); 
    }
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'auto',
    cursor: 'pointer',
    padding: '8px 12px',
    fontSize: '0.88rem'
  };

  return (
    <DashboardLayout activeSub="quizzes" setPage={setPage}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, margin: '0 0 6px', display:'flex', alignItems:'center', gap:10 }}>{retestMode ? t("إعادة الاختبار") : t("توليد اختبار بالذكاء الاصطناعي")} <PiRobotDuotone size={24} color={C.blue}/></h1>
          <p style={{ color: C.muted, fontSize: '0.88rem' }}>{retestMode ? t("اختبار من ملف سابق") : t("ارفع ملف مادتك وسيقوم الذكاء الاصطناعي بتوليد اختبار تفاعلي")}</p>
        </div>
        <Card style={{ padding: 36 }}>
          <Field label={t("اسم المادة")}><input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} placeholder={t("مثال: هندسة البرمجيات، أساسيات البرمجة...")} /></Field>
          
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: C.dark, marginBottom: 8 }}>{t("رفع ملف الدراسة")}</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.docx,.txt,.jpg,.jpeg,.png" />
            
            {retestMode ? (
              <div style={{ border: `1.5px solid ${C.blue}`, borderRadius: 13, padding: '24px', display:'flex', alignItems:'center', justifyContent:'space-between', background: C.blueLight }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ color: C.blue }}><PiFileTextDuotone size={34}/></div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.blue, fontSize: '0.92rem' }}>{pageData.fileName}</div>
                    <div style={{ color: C.muted, fontSize: '0.75rem' }}>{t("ملف من اختبار سابق")}</div>
                  </div>
                </div>
                <Btn variant="ghost" onClick={() => setRetestMode(false)} style={{ fontSize:'0.78rem', color:C.blue }}>{t("تغيير الملف")}</Btn>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{ border: `2px dashed ${selectedFile ? C.blue : 'color-mix(in srgb, ' + C.blue + ' 33%, transparent)'}`, borderRadius: 13, padding: '40px 28px', textAlign: 'center', background: selectedFile ? C.blueLight : `color-mix(in srgb, ${C.blueLight} 38%, transparent)`, cursor: 'pointer' }}
              >
                <div style={{ color:C.blue, marginBottom: 10, display:'flex', justifyContent:'center' }}><PiFileTextDuotone size={48}/></div>
                <div style={{ fontWeight: 600, color: C.dark, marginBottom: 6, fontSize: '0.92rem' }}>{selectedFile ? selectedFile.name : t("اسحب الملف هنا أو انقر للاختيار")}</div>
                <div style={{ color: C.muted, fontSize: '0.8rem' }}>{t("PDF أو DOCX — حد أقصى 10MB")}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.dark, marginBottom: 8 }}>{t("عدد الأسئلة")}</label>
              <select value={numQuestions} onChange={e => setNumQuestions(e.target.value)} style={selectStyle}>
                <option value="10">10 {t("أسئلة")}</option>
                <option value="20">20 {t("سؤال")}</option>
                <option value="30">30 {t("سؤال")}</option>
                <option value="40">40 {t("سؤال (حد أقصى)")}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.dark, marginBottom: 8 }}>{t("وقت الاختبار")}</label>
              <select value={timeLimit} onChange={e => setTimeLimit(e.target.value)} style={selectStyle}>
                <option value="10">10 {t("دقائق")}</option>
                <option value="20">20 {t("دقيقة")}</option>
                <option value="30">30 {t("دقيقة")}</option>
                <option value="40">40 {t("دقيقة")}</option>
                <option value="60">60 {t("دقيقة")}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.dark, marginBottom: 8 }}>{t("لغة الاختبار")}</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
                <option value="auto">{t("حسب محتوى الملف")}</option>
                <option value="ar">{t("عربي")}</option>
                <option value="en">{t("انجليزي")}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: C.dark, marginBottom: 8 }}>{t("درجة الصعوبة")}</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selectStyle}>
                <option value="simple">{t("بسيط")}</option>
                <option value="medium">{t("متوسط")}</option>
                <option value="hard">{t("صعب")}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
             <div style={{ background: C.bg, padding: '10px 14px', borderRadius: 9, fontSize: '0.82rem', color: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.blue, display:'flex' }}><PiInfoDuotone size={18}/></span>
                {t("50% اختيار من متعدد + 50% صح/خطأ")}
             </div>
          </div>

          <button onClick={generate} disabled={loading} style={{ width: '100%', background: loading ? C.muted : `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: C.white, border: 'none', borderRadius: 11, padding: '14px', fontSize: '0.98rem', fontWeight: 700, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> {t("جاري التوليد...")}</> : <><PiLightningDuotone size={20}/> {t("توليد الاختبار")}</>}
          </button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
