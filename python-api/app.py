from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Elite Platform - Smart Career Engine")

# تحميل الموديل
MODEL_PATH = 'career_model.pkl'
try:
    model = joblib.load(MODEL_PATH)
except:
    model = None

class StudentAnswers(BaseModel):
    q1: int; q2: int; q3: int; q4: int; q5: int; q6: int; q7: int; q8: int; q9: int; q10: int
    q11: int; q12: int; q13: int; q14: int; q15: int; q16: int; q17: int; q18: int; q19: int; q20: int
    q21: int; q22: int; q23: int; q24: int; q25: int; q26: int; q27: int; q28: int; q29: int; q30: int

    @validator('*')
    def check_range(cls, v):
        if not (1 <= v <= 5):
            raise ValueError('يرجى اختيار قيمة بين 1 و 5')
        return v

@app.post("/predict")
def predict_career(answers: StudentAnswers):
    if model is None:
        raise HTTPException(status_code=500, detail="المحرك الذكي قيد التحديث، يرجى المحاولة لاحقاً.")

    data_dict = answers.model_dump()
    all_answers = list(data_dict.values())
    
    # 1. التحقق من تكرار نفس الإجابة لجميع الأسئلة (بصرف النظر عن القيمة)
    # نتحقق مما إذا كانت جميع الإجابات مطابقة للإجابة الأولى
    if all(x == all_answers[0] for x in all_answers):
        return {
            "status": "validation_error",
            "message": "عزيزي المبدع، يبدو أنك اخترت نفس الإجابة لجميع الأسئلة. للحصول على نتيجة دقيقة تساعدك في رسم مستقبلك، نرجو منك قراءة كل سؤال بعناية والتعبير عن ميولك الحقيقية. نحن نثق بقدرتك على اختيار الأنسب لك!"
        }

    input_df = pd.DataFrame([data_dict])
    
    # 2. حساب الاحتمالات
    probabilities = model.predict_proba(input_df)[0]
    classes = model.classes_
    
    max_prob_idx = np.argmax(probabilities)
    top_field = classes[max_prob_idx]
    confidence_score = round(probabilities[max_prob_idx] * 100, 2)

    # 3. معالجة حالة التشتت (إجابات متناقضة تؤدي لثقة منخفضة)
    if confidence_score < 35:
        return {
            "status": "needs_refinement",
            "message": "لديك اهتمامات واسعة ومتنوعة، وهذا أمر رائع! ولكن لكي نتمكن من تحديد المسار الأكثر دقة لك، حاول التركيز أكثر على الأنشطة التي تشعر بشغف حقيقي تجاهها أثناء إعادة الإجابة. مستقبلك يستحق منك وقفة تأمل.",
            "hint": "يمكنك إعادة المحاولة مع التركيز على الميول الأكثر وضوحاً لديك."
        }

    # 4. الرد النهائي الناجح (مجال واحد فقط)
    return {
        "status": "success",
        "predicted_field": top_field,
        "confidence_score": f"{confidence_score}%",
        "message": f"بناءً على تحليلاتنا الذكية، وجدنا أن شغفك يلمع بقوة في مجال ({top_field}). هذا المسار يتوافق بشكل كبير مع مهاراتك وميولك التي شاركتنا بها. انطلق نحو هدفك بثقة!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)