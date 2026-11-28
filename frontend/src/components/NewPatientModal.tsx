import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { 
  X, 
  User, 
  CheckSquare, 
  Square, 
  QrCode, 
  Printer, 
  Loader2, 
  PackageCheck,
  Search,
  FlaskConical,
  Activity,
  Layers,
  Sparkles,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';

export interface TestOption {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  vial: string;
  tat: string;
}

export const DIAGNOSTIC_TESTS_CATALOG: TestOption[] = [
  // 1. HEMATOLOGY & COAGULATION
  { id: 'hem-1', name: 'Complete Blood Count (CBC + ESR)', code: 'CBC-ESR', category: 'Hematology', price: 400, vial: 'Purple (EDTA)', tat: '3 Hours' },
  { id: 'hem-2', name: 'Hemoglobin (Hb) Only', code: 'HB', category: 'Hematology', price: 100, vial: 'Purple (EDTA)', tat: '2 Hours' },
  { id: 'hem-3', name: 'Platelet Count (Automated + Smear)', code: 'PLT', category: 'Hematology', price: 150, vial: 'Purple (EDTA)', tat: '2 Hours' },
  { id: 'hem-4', name: 'Erythrocyte Sedimentation Rate (ESR)', code: 'ESR', category: 'Hematology', price: 120, vial: 'Black (Citrate)', tat: '2 Hours' },
  { id: 'hem-5', name: 'Prothrombin Time with INR (PT/INR)', code: 'PT-INR', category: 'Hematology', price: 350, vial: 'Light Blue (Citrate)', tat: '4 Hours' },
  { id: 'hem-6', name: 'Blood Grouping & Rh Factor (ABO-Rh)', code: 'BG-RH', category: 'Hematology', price: 150, vial: 'Purple (EDTA)', tat: '1 Hour' },
  { id: 'hem-7', name: 'Peripheral Blood Smear Examination (PBS)', code: 'PBS', category: 'Hematology', price: 250, vial: 'Purple (EDTA)', tat: '4 Hours' },

  // 2. BIOCHEMISTRY & ORGAN PROFILES
  { id: 'bio-1', name: 'Liver Function Test (LFT - 11 Parameters)', code: 'LFT', category: 'Biochemistry', price: 650, vial: 'Yellow (SST)', tat: '4 Hours' },
  { id: 'bio-2', name: 'Kidney Function Test (KFT / RFT with Urea & Creatinine)', code: 'KFT', category: 'Biochemistry', price: 600, vial: 'Yellow (SST)', tat: '4 Hours' },
  { id: 'bio-3', name: 'Lipid Profile (Cholesterol, HDL, LDL, VLDL, Triglycerides)', code: 'LIPID', category: 'Biochemistry', price: 600, vial: 'Yellow (SST)', tat: '4 Hours' },
  { id: 'bio-4', name: 'Serum Electrolytes (Sodium, Potassium, Chloride)', code: 'ELEC', category: 'Biochemistry', price: 450, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'bio-5', name: 'Serum Uric Acid', code: 'URIC', category: 'Biochemistry', price: 200, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'bio-6', name: 'Serum Calcium & Phosphorus', code: 'CA-PHOS', category: 'Biochemistry', price: 350, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'bio-7', name: 'Serum Amylase & Lipase (Pancreas)', code: 'AMY-LIP', category: 'Biochemistry', price: 750, vial: 'Yellow (SST)', tat: '4 Hours' },

  // 3. DIABETIC CARE & GLUCOSE
  { id: 'dia-1', name: 'Blood Glucose Fasting (FBS)', code: 'FBS', category: 'Diabetic Care', price: 80, vial: 'Grey (Fluoride)', tat: '2 Hours' },
  { id: 'dia-2', name: 'Blood Glucose Post-Prandial (PPBS)', code: 'PPBS', category: 'Diabetic Care', price: 80, vial: 'Grey (Fluoride)', tat: '2 Hours' },
  { id: 'dia-3', name: 'Blood Glucose Random (RBS)', code: 'RBS', category: 'Diabetic Care', price: 70, vial: 'Grey (Fluoride)', tat: '1 Hour' },
  { id: 'dia-4', name: 'HbA1c (Glycated Hemoglobin - 3 Months Avg)', code: 'HBA1C', category: 'Diabetic Care', price: 450, vial: 'Purple (EDTA)', tat: '3 Hours' },
  { id: 'dia-5', name: 'Oral Glucose Tolerance Test (OGTT)', code: 'OGTT', category: 'Diabetic Care', price: 250, vial: 'Grey (Fluoride)', tat: '4 Hours' },

  // 4. THYROID & HORMONES
  { id: 'thy-1', name: 'Thyroid Profile Total (T3, T4, TSH)', code: 'THY-TOTAL', category: 'Thyroid & Hormones', price: 450, vial: 'Yellow (SST)', tat: '4 Hours' },
  { id: 'thy-2', name: 'Thyroid Profile Free (FT3, FT4, TSH)', code: 'THY-FREE', category: 'Thyroid & Hormones', price: 750, vial: 'Yellow (SST)', tat: '4 Hours' },
  { id: 'thy-3', name: 'TSH (Ultra-sensitive 3rd Generation)', code: 'TSH', category: 'Thyroid & Hormones', price: 250, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'thy-4', name: 'Vitamin D (25-Hydroxy Total)', code: 'VIT-D', category: 'Thyroid & Hormones', price: 900, vial: 'Yellow (SST)', tat: 'Same Day' },
  { id: 'thy-5', name: 'Vitamin B12 (Cyanocobalamin)', code: 'VIT-B12', category: 'Thyroid & Hormones', price: 750, vial: 'Yellow (SST)', tat: 'Same Day' },
  { id: 'thy-6', name: 'Beta HCG (Quantitative Pregnancy)', code: 'BHCG', category: 'Thyroid & Hormones', price: 550, vial: 'Yellow (SST)', tat: '4 Hours' },

  // 5. SEROLOGY, FEVER & INFECTIONS
  { id: 'ser-1', name: 'Dengue NS1 Antigen + IgG/IgM Antibody Combo', code: 'DENGUE-COMBO', category: 'Serology & Infections', price: 850, vial: 'Yellow (SST)', tat: '2 Hours' },
  { id: 'ser-2', name: 'Widal Slide / Tube Agglutination (Typhoid)', code: 'WIDAL', category: 'Serology & Infections', price: 200, vial: 'Yellow (SST)', tat: '2 Hours' },
  { id: 'ser-3', name: 'Malaria Antigen Rapid Card Test (Pv / Pf)', code: 'MALARIA-AG', category: 'Serology & Infections', price: 250, vial: 'Purple (EDTA)', tat: '1 Hour' },
  { id: 'ser-4', name: 'Typhidot Rapid Test (IgM & IgG for Salmonella)', code: 'TYPHIDOT', category: 'Serology & Infections', price: 350, vial: 'Yellow (SST)', tat: '2 Hours' },
  { id: 'ser-5', name: 'C-Reactive Protein (CRP - Quantitative Turbidimetry)', code: 'CRP', category: 'Serology & Infections', price: 350, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'ser-6', name: 'Rheumatoid Factor (RA Factor)', code: 'RA-FACTOR', category: 'Serology & Infections', price: 300, vial: 'Yellow (SST)', tat: '3 Hours' },
  { id: 'ser-7', name: 'HIV 1 & 2 Rapid Screening (4th Gen ELISA/Card)', code: 'HIV', category: 'Serology & Infections', price: 350, vial: 'Red (Serum)', tat: '2 Hours' },
  { id: 'ser-8', name: 'HBsAg (Hepatitis B Surface Antigen)', code: 'HBSAG', category: 'Serology & Infections', price: 300, vial: 'Red (Serum)', tat: '2 Hours' },
  { id: 'ser-9', name: 'HCV (Hepatitis C Virus Antibody)', code: 'HCV', category: 'Serology & Infections', price: 400, vial: 'Red (Serum)', tat: '2 Hours' },

  // 6. CLINICAL PATHOLOGY & URINE/STOOL
  { id: 'uri-1', name: 'Complete Urine Routine & Microscopic Exam (CUE)', code: 'URINE-RE', category: 'Clinical Pathology', price: 150, vial: 'Sterile Cup', tat: '2 Hours' },
  { id: 'uri-2', name: 'Urine Pregnancy Test (UPT Rapid)', code: 'UPT', category: 'Clinical Pathology', price: 100, vial: 'Sterile Cup', tat: '30 Mins' },
  { id: 'uri-3', name: 'Urine Microalbumin / Creatinine Ratio (ACR)', code: 'URINE-ACR', category: 'Clinical Pathology', price: 450, vial: 'Sterile Cup', tat: '3 Hours' },
  { id: 'uri-4', name: 'Stool Routine & Occult Blood Test', code: 'STOOL-RE', category: 'Clinical Pathology', price: 200, vial: 'Sterile Stool Cup', tat: '3 Hours' },

  // 7. EXECUTIVE HEALTH PACKAGES
  { id: 'pkg-1', name: 'Basic Wellness Checkup (CBC + FBS + LFT + KFT + Urine)', code: 'PKG-BASIC', category: 'Health Packages', price: 1299, vial: 'Multiple Vials', tat: 'Same Day' },
  { id: 'pkg-2', name: 'Executive Heart & Diabetic Care (CBC + HbA1c + Lipid + KFT + Sugar)', code: 'PKG-CARDIAC', category: 'Health Packages', price: 1599, vial: 'Multiple Vials', tat: 'Same Day' },
  { id: 'pkg-3', name: 'Senior Citizen Platinum Care (CBC + LFT + KFT + Lipid + Thyroid + Vit D + B12)', code: 'PKG-PLATINUM', category: 'Health Packages', price: 2499, vial: 'Multiple Vials', tat: 'Same Day' }
];

export const CATEGORIES = [
  { id: 'All', label: 'All Tests', icon: '📋' },
  { id: 'Hematology', label: 'Hematology (Blood)', icon: '🩸' },
  { id: 'Biochemistry', label: 'Biochemistry & Organs', icon: '🧪' },
  { id: 'Diabetic Care', label: 'Diabetic & Sugar', icon: '🍬' },
  { id: 'Thyroid & Hormones', label: 'Thyroid & Hormones', icon: '🦋' },
  { id: 'Serology & Infections', label: 'Serology & Fever', icon: '🦠' },
  { id: 'Clinical Pathology', label: 'Urine & Stool', icon: '🔬' },
  { id: 'Health Packages', label: 'Health Packages', icon: '📦' },
];

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientRegistered: (patientData: any) => void;
}

const INITIAL_DOCTORS = [
  { id: 'doc-1', fullName: 'Self / Walk-in', degree: 'N/A', commissionPct: 0 },
  { id: 'doc-2', fullName: 'Dr. A. K. Sharma', degree: 'MD (Internal Medicine)', commissionPct: 15 },
  { id: 'doc-3', fullName: 'Dr. Priya Patel', degree: 'MBBS, DGO (Gynecologist)', commissionPct: 10 },
  { id: 'doc-4', fullName: 'Dr. Vikram Malhotra', degree: 'MS (General Surgery)', commissionPct: 12 },
  { id: 'doc-5', fullName: 'Dr. Harit Bansal', degree: 'MBBS, MD (General Physician)', commissionPct: 15 },
  { id: 'doc-6', fullName: 'Dr. Sanjay Gupta', degree: 'MD, DM (Cardiologist)', commissionPct: 15 },
  { id: 'doc-7', fullName: 'Dr. Neha Agarwal', degree: 'MD (Pediatrician)', commissionPct: 10 },
  { id: 'doc-8', fullName: 'Dr. R. K. Verma', degree: 'MS (Orthopedics)', commissionPct: 12 },
  { id: 'doc-9', fullName: 'Dr. Sunita Deshmukh', degree: 'MD (Diabetologist)', commissionPct: 15 },
  { id: 'doc-10', fullName: 'Dr. Manish Tiwari', degree: 'MD (Pulmonologist)', commissionPct: 12 }
];

export default function NewPatientModal({ isOpen, onClose, onPatientRegistered }: NewPatientModalProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [doctor, setDoctor] = useState('Self / Walk-in');
  const [doctorList, setDoctorList] = useState<any[]>(INITIAL_DOCTORS);
  const [selectedTests, setSelectedTests] = useState<TestOption[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);
  const [newOrderData, setNewOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Category and search filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setFullName('');
    setAge('');
    setGender('MALE');
    setPhone('');
    setDoctor('Self / Walk-in');
    setSelectedTests([]);
    setDiscount(0);
    setShowBarcodePreview(false);
    setNewOrderData(null);
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_BASE_URL}/api/doctors`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setDoctorList(res.data);
          }
        })
        .catch(e => console.log('Doctor fetch note:', e));
    } else {
      resetForm();
    }
  }, [isOpen]);

  // Filtered Tests based on Active Category and Search Term
  const filteredTests = useMemo(() => {
    return DIAGNOSTIC_TESTS_CATALOG.filter((test) => {
      const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        test.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Group filtered tests by Category for structured rendering
  const testsByCategory = useMemo(() => {
    const groups: { [key: string]: TestOption[] } = {};
    filteredTests.forEach((test) => {
      if (!groups[test.category]) groups[test.category] = [];
      groups[test.category].push(test);
    });
    return groups;
  }, [filteredTests]);

  if (!isOpen) return null;

  const toggleTest = (test: TestOption) => {
    if (selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeSelectedTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(t => t.id !== testId));
  };

  const subtotal = selectedTests.reduce((sum, t) => sum + t.price, 0);
  const finalAmount = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || selectedTests.length === 0) {
      alert('Please fill Patient Name, Phone and select at least one Test!');
      return;
    }

    setIsLoading(true);
    try {
      // 🚀 SEND DATA TO BACKEND REST API (Neon Cloud Database)
      const response = await axios.post(`${API_BASE_URL}/api/orders`, {
        fullName,
        age,
        gender,
        phone,
        doctor,
        testsList: selectedTests,
        totalAmount: finalAmount
      });

      const savedOrder = response.data;
      setNewOrderData(savedOrder);
      onPatientRegistered(savedOrder);
      setShowBarcodePreview(true);

    } catch (error) {
      console.error('Error saving to cloud database:', error);
      alert('Failed to save patient in database. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      {/* EXPANDED CONTAINER: max-w-4xl for comfortable category grid */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col h-[92vh]">
        
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">New Patient Registration & Test Prescriptions</h3>
              <p className="text-xs text-slate-500">Categorized Diagnostic Catalog with Real-Time Price Calculation</p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Modal Body (Scrollable Form) */}
        {!showBarcodePreview ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* SECTION A: PATIENT DEMOGRAPHICS */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>1. Patient Demographics</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input 
                    type="tel" 
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Yrs)</label>
                    <input 
                      type="number" 
                      placeholder="35"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-1.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Referring Doctor Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Referring Doctor / Consultant</label>
                <select 
                  value={doctor} 
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  <option value="Self / Walk-in">Self / Walk-in (0% Incentive)</option>
                  {doctorList.filter(d => d.fullName !== 'Self / Walk-in').map(d => (
                    <option key={d.id} value={d.fullName}>
                      {d.fullName} ({d.degree || 'MD'} - {d.commissionPct}% Referral Incentive)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION B: CATEGORIZED TEST SELECTION */}
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-purple-600" />
                    <span>2. Select Prescribed Tests by Category *</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Choose single tests or complete organ profiles</p>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search test name or code (e.g. CBC, LFT, Dengue)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY TABS PILLS */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const count = cat.id === 'All' 
                    ? DIAGNOSTIC_TESTS_CATALOG.length 
                    : DIAGNOSTIC_TESTS_CATALOG.filter(t => t.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition flex items-center space-x-1.5 cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TESTS LIST GROUPED BY CATEGORY */}
              <div className="space-y-5 max-h-[360px] overflow-y-auto pr-1">
                {Object.keys(testsByCategory).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-xs font-semibold">No tests match your search query: "{searchQuery}"</p>
                    <button 
                      type="button" 
                      onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                      className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  Object.entries(testsByCategory).map(([categoryName, tests]) => (
                    <div key={categoryName} className="space-y-2">
                      
                      {/* Category Header Label */}
                      <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Layers className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          {categoryName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({tests.length} tests)
                        </span>
                      </div>

                      {/* Test Grid for this Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tests.map((test) => {
                          const isChecked = selectedTests.some(t => t.id === test.id);
                          return (
                            <div 
                              key={test.id}
                              onClick={() => toggleTest(test)}
                              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                isChecked 
                                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20' 
                                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="flex items-start space-x-2.5">
                                <div className="mt-0.5">
                                  {isChecked ? (
                                    <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                                  ) : (
                                    <Square className="h-4 w-4 text-slate-300 shrink-0" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs leading-snug">
                                    {test.name}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                      {test.code}
                                    </span>
                                    <span className="text-[10px] text-purple-600 font-medium">
                                      {test.vial}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      • {test.tat}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0 ml-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                  isChecked 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  ₹{test.price}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

            {/* SECTION C: SELECTED TESTS SUMMARY CHIPS */}
            {selectedTests.length > 0 && (
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                    <span>Selected Tests ({selectedTests.length}):</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedTests([])}
                    className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedTests.map((t) => (
                    <span 
                      key={t.id}
                      className="inline-flex items-center space-x-1 bg-white border border-blue-300 text-blue-900 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs"
                    >
                      <span>{t.name} (₹{t.price})</span>
                      <button 
                        type="button"
                        onClick={() => removeSelectedTest(t.id)}
                        className="text-slate-400 hover:text-rose-600 ml-1 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION D: BILLING & PAYMENT SUMMARY */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal ({selectedTests.length} tests prescribed):</span>
                <span className="font-bold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Discount / Concession (₹):</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right text-xs border border-slate-300 rounded bg-white font-bold"
                  placeholder="0"
                />
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Net Total Payable:</span>
                <span className="text-blue-600 text-lg">₹{finalAmount}</span>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex justify-end space-x-3 pt-1">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading || selectedTests.length === 0}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center space-x-2 disabled:bg-blue-300 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving to Neon Cloud...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>Confirm Order & Generate Barcodes (₹{finalAmount})</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* BARCODE THERMAL STICKER PRINT PREVIEW */
          <div className="p-8 text-center space-y-6 flex-1 overflow-y-auto">
            <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <QrCode className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">Patient Order Registered Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1">Barcode label generated for sample collection vials.</p>
            </div>

            {/* Thermal Barcode Sticker Simulation */}
            <div className="mx-auto max-w-sm bg-white p-4 border-2 border-dashed border-slate-400 rounded-lg shadow-inner text-left font-mono">
              <div className="border-b pb-2 mb-2 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">CITY PATH LAB</span>
                <span className="text-[10px] text-slate-500">{newOrderData?.id}</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{newOrderData?.patient}</p>
              <p className="text-[11px] text-slate-600">UHID: {newOrderData?.uhid}</p>
              <p className="text-[10px] text-slate-500 mt-1">Tests: {newOrderData?.tests}</p>
              
              <div className="my-3 py-2 bg-slate-100 flex flex-col items-center justify-center rounded">
                <div className="flex items-center space-x-1 h-10">
                  {[4,2,6,1,3,5,2,4,6,1,2,5,3,4,2,6,1,3].map((w, idx) => (
                    <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }}></div>
                  ))}
                </div>
                <span className="text-xs tracking-widest font-bold mt-1 text-slate-800">{newOrderData?.barcode}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t">
                <span>Vials: Blood (Purple EDTA)</span>
                <span className="text-purple-600 font-bold">Collect Sample</span>
              </div>
            </div>

            {/* Inventory Auto-Deduction Notice */}
            {newOrderData?.inventoryDeducted && newOrderData.inventoryDeducted.length > 0 && (
              <div className="mx-auto max-w-sm bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 flex items-center space-x-2 text-left">
                <PackageCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Stock Deducted:</strong> {newOrderData.inventoryDeducted.join(' & ')}</span>
              </div>
            )}

            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => {
                  alert('Direct Thermal Printer ZPL Command Sent!');
                  handleCloseModal();
                }}
                className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Sticker (Thermal)</span>
              </button>
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
