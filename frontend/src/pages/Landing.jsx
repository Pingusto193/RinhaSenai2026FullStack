import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import BrandMark from '../components/BrandMark.jsx'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="hero">
      <div className="hero-split">
        <div>
          <span className="hero-eyebrow">
            <BrandMark size={14} /> carteira + investimentos + foguinho
          </span>
          <h1>
            Sua <span className="gradient-text">constancia</span> investindo,
            transformada em conquista.
          </h1>
          <p>
            Flinx e uma carteira digital com investimentos simulados, transferencias entre
            amigos por codigo pessoal e um foguinho que mede sua constancia investindo.
          </p>

          <div className="hero-cta">
            {user ? (
              <Link to="/dashboard" className="btn">Ir para o dashboard</Link>
            ) : (
              <>
                <Link to="/criar" className="btn">Criar conta gratis</Link>
                <Link to="/entrar" className="btn-secondary">Ja tenho conta</Link>
              </>
            )}
          </div>

          <div className="feature-row">
            <div className="card feature-card">Transparencia</div>
            <div className="card feature-card">Investimentos</div>
            <div className="card feature-card">Foguinho/amigos</div>
          </div>
        </div>

        <div className="flame-illustration" aria-hidden="true">
          <div className="flame-core">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat-item">
          <strong>10,5%</strong>
          <span>ao ano na renda fixa</span>
        </div>
        <div className="stat-item">
          <strong>R$ 0</strong>
          <span>taxa pra usar o Flinx</span>
        </div>
        <div className="stat-item">
          <strong>1 codigo</strong>
          <span>pra receber de qualquer amigo</span>
        </div>
        <div className="stat-item">
          <strong>todo dia</strong>
          <span>o foguinho conta sua constancia</span>
        </div>
      </div>

      <section className="how-it-works">
        <h2>Como funciona</h2>
        <div className="steps-row">
          <div className="card step-card">
            <span className="step-number">1</span>
            <h3>Crie sua conta</h3>
            <p>Cadastro gratuito e voce ja recebe um saldo inicial pra comecar a usar a carteira.</p>
          </div>
          <div className="card step-card">
            <span className="step-number">2</span>
            <h3>Invista e transfira</h3>
            <p>
              Escolha entre renda fixa ou variavel, e envie dinheiro pra amigos usando o codigo
              pessoal de cada um.
            </p>
          </div>
          <div className="card step-card">
            <span className="step-number">3</span>
            <h3>Mantenha o foguinho</h3>
            <p>
              Deixe o investimento acima do piso minimo pra manter sua sequencia ativa e subir no
              ranking dos amigos.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
