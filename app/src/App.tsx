import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TodaysStops from './screens/TodaysStops'
import FieldEntry from './screens/FieldEntry'
import DaySetup from './screens/DaySetup'
import ReviewQueue from './screens/ReviewQueue'
import ExportScreen from './screens/ExportScreen'
import ArchiveHistory from './screens/ArchiveHistory'
import Admin from './screens/Admin'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/stops" replace />} />
        <Route path="stops" element={<TodaysStops />} />
        <Route path="field/:harvestId" element={<FieldEntry />} />
        <Route path="day-setup" element={<DaySetup />} />
        <Route path="review" element={<ReviewQueue />} />
        <Route path="export" element={<ExportScreen />} />
        <Route path="archive" element={<ArchiveHistory />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}
