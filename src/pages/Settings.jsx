import Header from '../components/Header'

export default function Settings() {
  return (
    <div className="page-enter" style={{ background: '#F8F7F4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontFamily: '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '12px', color: '#bbb' }}>
        Settings — coming soon
      </div>
    </div>
  )
}
