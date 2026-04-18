from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# تهيئة تطبيق الـ API
app = FastAPI(title="Student Career Prediction API")

# تحميل الموديل المدرب مسبقاً
model = joblib.load('career_model.pkl')

# تعريف هيكل البيانات الذي يجب أن يرسله الـ API (30 سؤال)
class StudentAnswers(BaseModel):
    q1: int; q2: int; q3: int; q4: int; q5: int; q6: int; q7: int; q8: int; q9: int; q10: int
    q11: int; q12: int; q13: int; q14: int; q15: int; q16: int; q17: int; q18: int; q19: int; q20: int
    q21: int; q22: int; q23: int; q24: int; q25: int; q26: int; q27: int; q28: int; q29: int; q30: int

@app.post("/predict")
def predict_career(answers: StudentAnswers):
    # 1. تحويل الإجابات المستقبلة إلى صيغة يقبلها الموديل (DataFrame من صف واحد)
    # نستخدم model_dump() بدلاً من dict() في الإصدارات الحديثة من pydantic
    input_data = pd.DataFrame([answers.model_dump()])
    
    # 2. التنبؤ بالمجال المناسب
    prediction = model.predict(input_data)[0]
    
    # 3. حساب نسبة الثقة
    # الموديل يرجع مصفوفة بنسب التوافق لكل مجال، نأخذ أعلى نسبة
    probabilities = model.predict_proba(input_data)[0]
    max_prob = max(probabilities)
    confidence_score = round(max_prob * 100, 2) # تحويلها لنسبة مئوية مثل 85.5
    
    # 4. إرجاع النتيجة لمنصتك
    return {
        "predicted_field": prediction,
        "confidence_score": f"{confidence_score}%"
    }