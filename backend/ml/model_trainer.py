# smart_industry/backend/ml/advanced_model_trainer.py

import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier
import joblib
import os

# Load dataset
df = pd.read_csv('../logs/industry_data.csv')
df.dropna(inplace=True)

# ---- Risk Categorization ----
def categorize_risk(pm25, co, voc):
    if pm25 > 50 or co > 8 or voc > 3:
        return 'Critical'
    elif pm25 > 35 or co > 6 or voc > 2:
        return 'High'
    elif pm25 > 25 or co > 4 or voc > 1:
        return 'Moderate'
    else:
        return 'Low'

df['risk_level'] = df.apply(lambda row: categorize_risk(row['pm25'], row['co'], row['voc']), axis=1)

# ---- Age Grouping ----
def age_group(age):
    age = int(age)
    if 18 <= age <= 25:
        return '18-25'
    elif age <= 35:
        return '26-35'
    elif age <= 45:
        return '36-45'
    elif age <= 55:
        return '46-55'
    elif age <= 65:
        return '56-65'
    else:
        return '66-70'

df['age_group'] = df['age'].apply(age_group)

# ---- Categorical Encoding ----
categorical_cols = ['zone', 'age_group', 'health_condition']
one_hot_encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
encoded_cats = one_hot_encoder.fit_transform(df[categorical_cols])
encoded_df = pd.DataFrame(encoded_cats, columns=one_hot_encoder.get_feature_names_out(categorical_cols))

# Save encoder
os.makedirs('models', exist_ok=True)
joblib.dump(one_hot_encoder, 'models/onehot_encoder.pkl')

# ---- Feature Set Construction ----
numerical_cols = ['temperature', 'humidity', 'voc', 'co', 'pm1', 'pm25', 'pm10']
X_numerical = df[numerical_cols].reset_index(drop=True)
X = pd.concat([X_numerical, encoded_df], axis=1)
y = df['risk_level']

# ---- Label Encoding (target) ----
le = LabelEncoder()
y_encoded = le.fit_transform(y)
joblib.dump(le, 'models/label_encoder.pkl')

# ---- Feature Scaling ----
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, 'models/feature_scaler.pkl')

# ---- Train-Test Split ----
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)

# ---- XGBoost Training ----
xgb_model = XGBClassifier(objective='multi:softmax', num_class=4, eval_metric='mlogloss', use_label_encoder=False)
param_grid = {
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1],
    'n_estimators': [50, 100]
}

grid = GridSearchCV(xgb_model, param_grid, cv=3, verbose=1, n_jobs=-1)
grid.fit(X_train, y_train)

# ---- Save Best Model ----
best_model = grid.best_estimator_
joblib.dump(best_model, 'models/risk_predictor.pkl')

# ---- Evaluation ----
y_pred = best_model.predict(X_test)
print("✅ Classification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))
print("✅ Accuracy:", accuracy_score(y_test, y_pred))

# ---- Feature Importance ----
importance_df = pd.DataFrame({
    'Feature': X.columns,
    'Importance': best_model.feature_importances_
}).sort_values(by='Importance', ascending=False)

importance_df.to_csv('models/feature_importance.csv', index=False)

print("✅ Personalized Advanced ML Model Trained and Saved in 'models/' folder")
