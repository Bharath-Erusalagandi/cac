Video explaining how the application works : https://vimeo.com/1132353069?share=copy&fl=sv&fe=ci

Features

    Advanced Ensemble Model: Combines Random Forest, XGBoost, LightGBM, Gradient Boosting, and ExtraTrees classifiers
    High Accuracy: Achieves 81.96% test accuracy with 89.92% ROC-AUC score
    Interactive Web Interface: User-friendly Flask web application for real-time predictions
    NASA Data Integration: Trained on 21,000+ samples from Kepler, K2, and TESS missions
    Real-time Classification: Input stellar and planetary parameters for instant predictions
    Professional UI: Modern, responsive design optimized for hackathon presentation

Model Performance
Test Set Results

    Accuracy: 81.96%
    Precision: 79.23%
    Recall: 85.59%
    F1 Score: 82.29%
    ROC-AUC: 89.92%

Validation Results

    Accuracy: 80.95%
    Precision: 77.33%
    Recall: 86.43%
    F1 Score: 81.63%
    ROC-AUC: 88.18%

Technical Architecture
Machine Learning Stack

    scikit-learn: Core ML algorithms and preprocessing
    XGBoost: Extreme gradient boosting
    LightGBM: Microsoft's gradient boosting framework
    imblearn: SMOTE for class balancing
    pandas/numpy: Data manipulation and numerical computing

Web Application Stack

    Flask: Python web framework
    HTML5/CSS3: Frontend markup and styling
    JavaScript: Client-side interactivity
    Font Awesome: Icon framework

Data Processing

    Feature Engineering: 12 core parameters for classification
    Data Harmonization: Standardized column names across missions
    Missing Value Handling: Median imputation for robust predictions
    Feature Scaling: StandardScaler for optimal model performance

Dataset Information
Data Sources

    Kepler Mission: Primary exoplanet discovery data
    K2 Mission: Extended Kepler mission data
    TESS Mission: Transiting Exoplanet Survey Satellite data

Features Used

    Orbital Period (pl_orbper): Planet's orbital period in days
    Transit Duration (pl_trandur): Transit duration in hours
    Transit Depth (pl_trandep): Transit depth in parts per million
    Planet Radius (pl_rade): Planet radius in Earth radii
    Planet Temperature (pl_eqt): Equilibrium temperature in Kelvin
    Insolation Flux (pl_insol): Stellar flux relative to Earth
    Impact Parameter (pl_imppar): Transit impact parameter
    Star Temperature (st_teff): Stellar effective temperature
    Star Radius (st_rad): Stellar radius in solar radii
    Star Surface Gravity (st_logg): Stellar surface gravity
    Right Ascension (ra): Celestial longitude
    Declination (dec): Celestial latitude

