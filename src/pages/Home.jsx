import Header from '../components/Header'

const HN = '"Hiragino Kaku Gothic Pro", "Hiragino Sans", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif'

export default function Home() {
  const colStyle = { borderRight: '1px solid rgba(0,0,0,0.15)', boxSizing: 'border-box' }

  return (
    <div className="page-enter" style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left gutter */}
        <div style={{ ...colStyle, width: '90px', flexShrink: 0 }} />

        {/* Main content */}
        <div style={{ ...colStyle, flex: 1, padding: '48px 40px 40px' }}>
          <div style={{
            fontFamily: HN, fontSize: '75px', fontWeight: 400,
            textTransform: 'uppercase', color: '#0A0A0A', lineHeight: 1.15,
          }}>
            Brief Generator<br />and Community
          </div>
          <div style={{ borderTop: '1px dashed rgba(0,0,0,0.3)', margin: '24px 0 40px' }} />

          {/* Image placeholder frames — to be filled in with real work later */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
            <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '2px', height: '210px' }} />
            <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '2px', height: '320px' }} />
          </div>
        </div>

        {/* Right: Highlights sidebar */}
        <div style={{ width: '224px', flexShrink: 0, padding: '48px 24px' }}>
          <div style={{
            fontFamily: HN, fontSize: '13px', fontWeight: 400,
            textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A0A0A',
          }}>
            Highlights
          </div>
          <div style={{ fontFamily: HN, fontSize: '11px', color: '#bbb', marginTop: '16px' }}>
            Featured community work will show up here soon.
          </div>
        </div>
      </div>
    </div>
  )
}
