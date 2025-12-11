import { useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [sensors, setSensors] = useState({
    s2: 642.58, s3: 1581.22, s4: 1398.91, s7: 554.42,
    s8: 2388.08, s9: 9056.40, s11: 47.23, s12: 521.79,
    s13: 2388.06, s15: 8.4024, s17: 393.0, s20: 38.81, s21: 23.3552
  });

  const simulateData = (type) => {
    let newData = {};
    if (type === 'good') {
      newData = {
        s2: 641.0 + Math.random(), s3: 1580 + Math.random()*5, 
        s4: 1390 + Math.random()*5, s7: 554.0 + Math.random(),
        s8: 2388.0 + Math.random(), s9: 9050 + Math.random()*10, 
        s11: 47.0 + Math.random(), s12: 522.0 + Math.random(),
        s13: 2388.0, s15: 8.3 + Math.random()*0.1, 
        s17: 391 + Math.floor(Math.random()*2), s20: 39.0 + Math.random(), 
        s21: 23.4 + Math.random()*0.1
      };
    } else {
      newData = {
        s2: 643.5 + Math.random(), s3: 1600 + Math.random()*10, 
        s4: 1420 + Math.random()*10, s7: 551.5 + Math.random(),
        s8: 2388.2 + Math.random(), s9: 9065 + Math.random()*10, 
        s11: 48.0 + Math.random(), s12: 520.0 + Math.random(),
        s13: 2388.2, s15: 8.5 + Math.random()*0.1, 
        s17: 395 + Math.floor(Math.random()*2), s20: 38.4 + Math.random(), 
        s21: 23.1 + Math.random()*0.1
      };
    }
    setSensors(newData);
    setResult(null); 
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${API_URL}/predict`, {
          sensor_data: sensors
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to API. Is backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Aircraft Engine RUL Prediction
          </h1>
          <p className="text-slate-600">
            NASA C-MAPSS Data | Powered by XGBoost & FastAPI
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Controls & Inputs */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="text-blue-500" /> Sensor Readings
              </h2>
              <div className="space-x-2">
                <button onClick={() => simulateData('good')} className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                  Simulate Healthy
                </button>
                <button onClick={() => simulateData('bad')} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                  Simulate Fail
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {Object.entries(sensors).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-2 rounded border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase block">{key}</label>
                  <input 
                    type="number" 
                    value={Number(value).toFixed(2)}
                    onChange={(e) => setSensors({...sensors, [key]: parseFloat(e.target.value)})}
                    className="w-full bg-transparent font-mono text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handlePredict}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all flex justify-center items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" /> : "Run Prediction Analysis"}
            </button>
          </div>

          {/* Right Column: Result Dashboard */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center relative overflow-hidden">
            {result ? (
              <div className="text-center w-full z-10 animate-fade-in-up">
                <div className={`text-6xl font-black mb-2 ${result.color_code === 'red' ? 'text-red-500' : result.color_code === 'orange' ? 'text-orange-500' : 'text-green-500'}`}>
                  {result.predicted_rul.toFixed(0)}
                </div>
                <div className="text-slate-400 text-sm uppercase tracking-wider mb-6">Cycles Remaining</div>
                
                <div className={`p-4 rounded-lg border-l-4 text-left ${result.color_code === 'red' ? 'bg-red-50 border-red-500 text-red-700' : result.color_code === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                  <div className="flex items-start gap-3">
                    {result.color_code === 'red' ? <AlertTriangle /> : <CheckCircle />}
                    <div>
                      <h3 className="font-bold">{result.status}</h3>
                      <p className="text-sm opacity-80">{result.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center">
                <Activity size={64} className="mx-auto mb-4 opacity-20" />
                <p>Waiting for data analysis...</p>
              </div>
            )}
            
            {/* Background Decoration */}
            <div className={`absolute top-0 left-0 w-full h-2 ${result ? (result.color_code === 'red' ? 'bg-red-500' : result.color_code === 'orange' ? 'bg-orange-500' : 'bg-green-500') : 'bg-slate-200'}`}></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;