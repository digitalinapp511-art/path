export interface TestParameterDef {
  id: string;
  name: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  criticalLow: number;
  criticalHigh: number;
  normalDefault: string;
  category: string;
}

export const PARAMETERS_BY_TEST: Record<string, TestParameterDef[]> = {
  // 1. HEMATOLOGY (CBC)
  HEMATOLOGY: [
    { id: 'h-1', name: 'Hemoglobin (Hb)', unit: 'g/dL', normalLow: 13.0, normalHigh: 17.0, criticalLow: 7.0, criticalHigh: 20.0, normalDefault: '14.5', category: 'Hematology' },
    { id: 'h-2', name: 'Total Leukocyte Count (TLC / WBC)', unit: '/cumm', normalLow: 4000, normalHigh: 11000, criticalLow: 2000, criticalHigh: 30000, normalDefault: '7200', category: 'Hematology' },
    { id: 'h-3', name: 'Platelet Count', unit: '/cumm', normalLow: 150000, normalHigh: 450000, criticalLow: 25000, criticalHigh: 1000000, normalDefault: '260000', category: 'Hematology' },
    { id: 'h-4', name: 'R.B.C. Count', unit: 'mil/cumm', normalLow: 4.5, normalHigh: 5.5, criticalLow: 2.5, criticalHigh: 7.0, normalDefault: '4.8', category: 'Hematology' },
    { id: 'h-5', name: 'Packed Cell Volume (PCV)', unit: '%', normalLow: 40.0, normalHigh: 50.0, criticalLow: 20.0, criticalHigh: 60.0, normalDefault: '43.5', category: 'Hematology' },
    { id: 'h-6', name: 'Erythrocyte Sedimentation Rate (ESR)', unit: 'mm/1st hr', normalLow: 0, normalHigh: 15, criticalLow: 0, criticalHigh: 60, normalDefault: '8', category: 'Hematology' }
  ],

  // 2. BIOCHEMISTRY - LIVER FUNCTION TEST (LFT)
  LFT: [
    { id: 'l-1', name: 'Serum Bilirubin (Total)', unit: 'mg/dL', normalLow: 0.2, normalHigh: 1.2, criticalLow: 0.1, criticalHigh: 5.0, normalDefault: '0.8', category: 'Biochemistry' },
    { id: 'l-2', name: 'Serum Bilirubin (Direct / Conjugated)', unit: 'mg/dL', normalLow: 0.0, normalHigh: 0.3, criticalLow: 0.0, criticalHigh: 2.0, normalDefault: '0.2', category: 'Biochemistry' },
    { id: 'l-3', name: 'SGOT / AST (Aspartate Aminotransferase)', unit: 'U/L', normalLow: 10, normalHigh: 40, criticalLow: 5, criticalHigh: 250, normalDefault: '24', category: 'Biochemistry' },
    { id: 'l-4', name: 'SGPT / ALT (Alanine Aminotransferase)', unit: 'U/L', normalLow: 10, normalHigh: 45, criticalLow: 5, criticalHigh: 300, normalDefault: '28', category: 'Biochemistry' },
    { id: 'l-5', name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', normalLow: 30, normalHigh: 120, criticalLow: 15, criticalHigh: 450, normalDefault: '78', category: 'Biochemistry' },
    { id: 'l-6', name: 'Total Serum Protein', unit: 'g/dL', normalLow: 6.0, normalHigh: 8.3, criticalLow: 4.0, criticalHigh: 11.0, normalDefault: '7.2', category: 'Biochemistry' },
    { id: 'l-7', name: 'Serum Albumin', unit: 'g/dL', normalLow: 3.5, normalHigh: 5.0, criticalLow: 2.0, criticalHigh: 6.5, normalDefault: '4.2', category: 'Biochemistry' }
  ],

  // 3. BIOCHEMISTRY - KIDNEY FUNCTION TEST (KFT)
  KFT: [
    { id: 'k-1', name: 'Blood Urea', unit: 'mg/dL', normalLow: 15.0, normalHigh: 45.0, criticalLow: 5.0, criticalHigh: 120.0, normalDefault: '26.0', category: 'Biochemistry' },
    { id: 'k-2', name: 'Serum Creatinine', unit: 'mg/dL', normalLow: 0.6, normalHigh: 1.2, criticalLow: 0.3, criticalHigh: 6.0, normalDefault: '0.9', category: 'Biochemistry' },
    { id: 'k-3', name: 'Serum Uric Acid', unit: 'mg/dL', normalLow: 3.5, normalHigh: 7.2, criticalLow: 1.5, criticalHigh: 12.0, normalDefault: '5.1', category: 'Biochemistry' },
    { id: 'k-4', name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', normalLow: 7.0, normalHigh: 20.0, criticalLow: 3.0, criticalHigh: 60.0, normalDefault: '12.5', category: 'Biochemistry' }
  ],

  // 4. BIOCHEMISTRY - LIPID PROFILE
  LIPID: [
    { id: 'lp-1', name: 'Total Serum Cholesterol', unit: 'mg/dL', normalLow: 125, normalHigh: 200, criticalLow: 80, criticalHigh: 350, normalDefault: '168', category: 'Biochemistry' },
    { id: 'lp-2', name: 'HDL Cholesterol (Good)', unit: 'mg/dL', normalLow: 40, normalHigh: 60, criticalLow: 25, criticalHigh: 90, normalDefault: '48', category: 'Biochemistry' },
    { id: 'lp-3', name: 'LDL Cholesterol (Bad)', unit: 'mg/dL', normalLow: 50, normalHigh: 100, criticalLow: 30, criticalHigh: 220, normalDefault: '88', category: 'Biochemistry' },
    { id: 'lp-4', name: 'Serum Triglycerides', unit: 'mg/dL', normalLow: 50, normalHigh: 150, criticalLow: 30, criticalHigh: 500, normalDefault: '115', category: 'Biochemistry' },
    { id: 'lp-5', name: 'VLDL Cholesterol', unit: 'mg/dL', normalLow: 5, normalHigh: 30, criticalLow: 2, criticalHigh: 70, normalDefault: '22', category: 'Biochemistry' }
  ],

  // 5. DIABETIC CARE
  DIABETIC: [
    { id: 'd-1', name: 'Fasting Blood Glucose (FBS)', unit: 'mg/dL', normalLow: 70, normalHigh: 100, criticalLow: 45, criticalHigh: 400, normalDefault: '88', category: 'Diabetic Care' },
    { id: 'd-2', name: 'Post-Prandial Glucose (PPBS)', unit: 'mg/dL', normalLow: 70, normalHigh: 140, criticalLow: 50, criticalHigh: 450, normalDefault: '120', category: 'Diabetic Care' },
    { id: 'd-3', name: 'HbA1c (Glycated Hemoglobin)', unit: '%', normalLow: 4.0, normalHigh: 5.6, criticalLow: 3.5, criticalHigh: 14.0, normalDefault: '5.2', category: 'Diabetic Care' }
  ],

  // 6. THYROID & HORMONES
  THYROID: [
    { id: 't-1', name: 'Total Triiodothyronine (T3)', unit: 'ng/mL', normalLow: 0.8, normalHigh: 2.0, criticalLow: 0.3, criticalHigh: 5.0, normalDefault: '1.25', category: 'Thyroid & Hormones' },
    { id: 't-2', name: 'Total Thyroxine (T4)', unit: 'µg/dL', normalLow: 5.1, normalHigh: 14.1, criticalLow: 2.0, criticalHigh: 22.0, normalDefault: '8.4', category: 'Thyroid & Hormones' },
    { id: 't-3', name: 'TSH (3rd Gen Ultra-sensitive)', unit: 'µIU/mL', normalLow: 0.35, normalHigh: 5.50, criticalLow: 0.05, criticalHigh: 25.0, normalDefault: '2.40', category: 'Thyroid & Hormones' }
  ],

  // 7. SEROLOGY & INFECTIONS
  SEROLOGY: [
    { id: 's-1', name: 'C-Reactive Protein (CRP - Quantitative)', unit: 'mg/L', normalLow: 0.0, normalHigh: 6.0, criticalLow: 0.0, criticalHigh: 100.0, normalDefault: '2.1', category: 'Serology' },
    { id: 's-2', name: 'Dengue NS1 Antigen', unit: 'Card Test', normalLow: 0, normalHigh: 0, criticalLow: 0, criticalHigh: 1, normalDefault: 'Negative', category: 'Serology' },
    { id: 's-3', name: 'Dengue IgM Antibody', unit: 'Card Test', normalLow: 0, normalHigh: 0, criticalLow: 0, criticalHigh: 1, normalDefault: 'Negative', category: 'Serology' },
    { id: 's-4', name: 'Widal Slide Test (S. Typhi O)', unit: 'Titre', normalLow: 0, normalHigh: 80, criticalLow: 0, criticalHigh: 320, normalDefault: '1:40 (Negative)', category: 'Serology' }
  ],

  // 8. CLINICAL PATHOLOGY (URINE)
  URINE: [
    { id: 'u-1', name: 'Urine Color & Appearance', unit: 'Visual', normalLow: 0, normalHigh: 0, criticalLow: 0, criticalHigh: 0, normalDefault: 'Pale Yellow / Clear', category: 'Clinical Pathology' },
    { id: 'u-2', name: 'Urine pH (Reaction)', unit: 'pH', normalLow: 5.0, normalHigh: 8.0, criticalLow: 4.5, criticalHigh: 9.0, normalDefault: '6.5', category: 'Clinical Pathology' },
    { id: 'u-3', name: 'Specific Gravity', unit: 'g/mL', normalLow: 1.010, normalHigh: 1.030, criticalLow: 1.000, criticalHigh: 1.045, normalDefault: '1.020', category: 'Clinical Pathology' },
    { id: 'u-4', name: 'Urine Protein / Albumin', unit: 'Dipstick', normalLow: 0, normalHigh: 0, criticalLow: 0, criticalHigh: 3, normalDefault: 'Nil / Negative', category: 'Clinical Pathology' },
    { id: 'u-5', name: 'Urine Sugar / Glucose', unit: 'Dipstick', normalLow: 0, normalHigh: 0, criticalLow: 0, criticalHigh: 3, normalDefault: 'Nil / Negative', category: 'Clinical Pathology' },
    { id: 'u-6', name: 'Pus Cells (Leukocytes)', unit: '/HPF', normalLow: 0, normalHigh: 5, criticalLow: 0, criticalHigh: 50, normalDefault: '1 - 2', category: 'Clinical Pathology' }
  ]
};

/**
 * Returns the appropriate list of parameters based on the order's test string or test list.
 */
export function getParametersForOrder(order: any): TestParameterDef[] {
  const testsStr = (order?.tests || '').toLowerCase();

  // If specific categories match
  if (testsStr.includes('lft') || testsStr.includes('liver')) {
    return PARAMETERS_BY_TEST.LFT;
  }
  if (testsStr.includes('kft') || testsStr.includes('rft') || testsStr.includes('kidney')) {
    return PARAMETERS_BY_TEST.KFT;
  }
  if (testsStr.includes('lipid') || testsStr.includes('cholesterol')) {
    return PARAMETERS_BY_TEST.LIPID;
  }
  if (testsStr.includes('thyroid') || testsStr.includes('tsh') || testsStr.includes('t3')) {
    return PARAMETERS_BY_TEST.THYROID;
  }
  if (testsStr.includes('glucose') || testsStr.includes('sugar') || testsStr.includes('hba1c') || testsStr.includes('fbs') || testsStr.includes('diabetic')) {
    return PARAMETERS_BY_TEST.DIABETIC;
  }
  if (testsStr.includes('urine') || testsStr.includes('cue') || testsStr.includes('stool')) {
    return PARAMETERS_BY_TEST.URINE;
  }
  if (testsStr.includes('dengue') || testsStr.includes('widal') || testsStr.includes('crp') || testsStr.includes('malaria')) {
    return PARAMETERS_BY_TEST.SEROLOGY;
  }
  if (testsStr.includes('package') || testsStr.includes('pkg') || testsStr.includes('wellness') || testsStr.includes('platinum')) {
    // Return comprehensive package parameters (CBC + FBS + LFT + KFT)
    return [
      ...PARAMETERS_BY_TEST.HEMATOLOGY.slice(0, 4),
      ...PARAMETERS_BY_TEST.DIABETIC.slice(0, 2),
      ...PARAMETERS_BY_TEST.LFT.slice(0, 4),
      ...PARAMETERS_BY_TEST.KFT.slice(0, 2)
    ];
  }

  // Default to Complete Blood Count (CBC)
  return PARAMETERS_BY_TEST.HEMATOLOGY;
}

/**
 * Returns the clinical department title & testing methodology based on the test name.
 */
export function getDepartmentForTest(testsStr: string): { department: string; method: string } {
  const s = (testsStr || '').toLowerCase();
  if (s.includes('lft') || s.includes('kft') || s.includes('lipid') || s.includes('biochemistry')) {
    return {
      department: 'DEPARTMENT OF CLINICAL BIOCHEMISTRY',
      method: 'Fully Automated Chemistry Analyzer (Photometry & ISE)'
    };
  }
  if (s.includes('thyroid') || s.includes('hormone') || s.includes('vitamin')) {
    return {
      department: 'DEPARTMENT OF ENDOCRINOLOGY & IMMUNOASSAY',
      method: 'Chemiluminescence Immunoassay (CLIA)'
    };
  }
  if (s.includes('diabetic') || s.includes('glucose') || s.includes('sugar') || s.includes('hba1c')) {
    return {
      department: 'DEPARTMENT OF DIABETOLOGY & METABOLIC CARE',
      method: 'Automated HPLC / Hexokinase Enzymatic'
    };
  }
  if (s.includes('urine') || s.includes('stool') || s.includes('clinical pathology')) {
    return {
      department: 'DEPARTMENT OF CLINICAL PATHOLOGY',
      method: 'Automated Reflectance Photometry & Brightfield Microscopy'
    };
  }
  if (s.includes('dengue') || s.includes('serology') || s.includes('infection') || s.includes('widal') || s.includes('hiv')) {
    return {
      department: 'DEPARTMENT OF SEROLOGY & MOLECULAR DIAGNOSTICS',
      method: 'Rapid Immunochromatography & Specific Turbidimetry'
    };
  }
  if (s.includes('package') || s.includes('wellness')) {
    return {
      department: 'COMPREHENSIVE MULTI-SPECIALTY DIAGNOSTIC PANEL',
      method: 'Multi-Platform Automated Analyzer Array'
    };
  }

  return {
    department: 'DEPARTMENT OF HEMATOLOGY & CLINICAL PATHOLOGY',
    method: 'Automated 5-Part Hematology Analyzer & Laser Flow Cytometry'
  };
}
