import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowDown, Check, ChevronRight, BarChart3, MessageSquare, 
  Globe, Zap, Target, TrendingUp, Mail, Phone, MapPin, 
  Send, Shield, Rocket, Activity 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [headerBlur, setHeaderBlur] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  
  // Generate Hero Image with Gemini
  useEffect(() => {
    const generateImage = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { 
            parts: [{ 
              text: 'Futuristic high-tech data visualization, glowing cyan and white neural network lines on a solid deep black background, minimalist, professional, 4k resolution, cinematic lighting.' 
            }] 
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K"
            },
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setHeroImage(`data:image/png;base64,${part.inlineData.data}`);
            setIsGenerating(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error generating image:", error);
        // Fallback to a high-quality tech image if generation fails
        setHeroImage("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072");
        setIsGenerating(false);
      }
    };

    generateImage();
  }, []);

  // Scroll handler for header and parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setHeaderBlur(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optionally unobserve after revealing
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      business: formData.get('business') as string,
      phone: (formData.get('phone') as string) || "",
      message: formData.get('message') as string,
      createdAt: serverTimestamp(),
    };

    try {
      const leadsRef = collection(db, 'leads');
      await addDoc(leadsRef, data);
      
      setSubmitStatus({ success: true, message: '¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.' });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, 'leads');
      } catch (err) {
        // Error already logged by handleFirestoreError
      }
      setSubmitStatus({ success: false, message: 'Hubo un error al enviar la solicitud. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative selection:bg-primary/30 bg-background text-white min-h-screen">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${headerBlur ? 'glass py-3' : 'bg-background/95 backdrop-blur-md py-4 border-b border-white/5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div 
            className="text-2xl font-bold tracking-tighter cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-white group-hover:text-primary transition-colors">Zy</span>
            <span className="text-primary group-hover:text-white transition-colors">neth</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted">
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-white transition-colors">Cómo funciona</button>
            <button onClick={() => scrollToSection('servicios')} className="hover:text-white transition-colors">Servicios</button>
            <button onClick={() => scrollToSection('sistema')} className="hover:text-white transition-colors">Sistema</button>
            <button onClick={() => scrollToSection('precios')} className="hover:text-white transition-colors">Precios</button>
            <button onClick={() => scrollToSection('suscripciones')} className="hover:text-white transition-colors">Suscripciones</button>
          </nav>

          <button 
            onClick={() => scrollToSection('contacto')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 glow-primary-hover"
          >
            Solicitar análisis <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {/* Spacer to separate header from hero */}
      <div className="h-20 md:h-24 bg-background" />

      {/* HERO SECTION */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-background">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted font-bold animate-pulse">Generando visión tecnológica...</p>
              </div>
            </div>
          ) : (
            <img 
              src={heroImage || ""} 
              className="w-full h-full object-cover opacity-60 will-change-transform"
              style={{ 
                transform: `translateY(${scrollY * 0.05}px) scale(${1.02 + scrollY * 0.00005})`,
                transition: 'transform 0.1s ease-out'
              }}
              alt="Zyneth Hero"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="hero-overlay" />
          
          {/* Hero Content */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 reveal reveal-up"
            style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
          >
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-tight tracking-tight">
                Convierte tu web en una <span className="text-gradient-primary">máquina de clientes</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                Diseñamos webs de alto rendimiento y sistemas de datos que te dicen exactamente cómo escalar tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className="bg-accent hover:bg-accent/90 text-background px-8 py-4 rounded-full text-lg font-bold transition-all glow-accent-hover"
                >
                  Solicitar análisis gratuito
                </button>
                <button 
                  onClick={() => scrollToSection('sistema')}
                  className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full text-lg font-bold transition-all backdrop-blur-sm"
                >
                  Ver sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-32 bg-background relative z-10">
        <div className="container mx-auto px-6 text-center reveal reveal-up">
          <div>
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">El Desafío</span>
            <h2 className="text-3xl md:text-6xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
              La mayoría de negocios tienen web, pero <span className="text-muted">no saben si realmente funciona</span>
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              Inviertes en publicidad y diseño, pero los clientes no llegan. El problema no es tu producto, es tu sistema de conversión y la falta de datos claros.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section id="como-funciona" className="py-32 bg-card/30 border-y border-border relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 reveal reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">El Ecosistema Zyneth</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Tres pilares fundamentales conectados para garantizar un crecimiento predecible y escalable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative reveal-stagger">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />
            
            {[
              { icon: <Globe className="text-primary" />, title: "Web Optimizada", desc: "Diseño premium enfocado 100% en la conversión. Velocidad de carga instantánea y UX intuitiva." },
              { icon: <MessageSquare className="text-secondary" />, title: "Chatbot IA", desc: "Atención 24/7 que califica leads, resuelve dudas y cierra citas automáticamente en tu calendario." },
              { icon: <BarChart3 className="text-accent" />, title: "Análisis de Datos", desc: "Dashboards personalizados que transforman el ruido en decisiones estratégicas rentables." }
            ].map((item, i) => (
              <div key={i} className="interactive-card p-10 rounded-[2.5rem] relative z-10">
                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-8 border border-border shadow-inner">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SISTEMA (Dashboard Visual) */}
      <section id="sistema" className="py-32 bg-background relative z-10 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="reveal reveal-left">
              <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">Tecnología Propia</span>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                Toma el control total de tu <span className="text-primary">crecimiento</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Dashboard en tiempo real", desc: "Visualiza de dónde vienen tus clientes, cuánto te cuesta cada uno y cuál es tu ROI real." },
                  { title: "Automatización inteligente", desc: "Reduce el trabajo manual en un 70% y deja que la IA gestione tus leads más calificados." },
                  { title: "Optimización continua", desc: "No lanzamos y olvidamos. Ajustamos tu estrategia cada semana basándonos en el comportamiento del usuario." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="mt-1 bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors h-fit">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative reveal reveal-right">
              {/* Mockup Dashboard */}
              <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 bg-red-500/50 rounded-full" />
                    <div className="h-3 w-3 bg-yellow-500/50 rounded-full" />
                    <div className="h-3 w-3 bg-green-500/50 rounded-full" />
                  </div>
                  <div className="h-4 w-32 bg-border rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                  <div className="bg-background/50 p-6 rounded-3xl border border-border backdrop-blur-sm">
                    <p className="text-xs text-muted font-bold uppercase tracking-wider mb-2">Conversión</p>
                    <p className="text-3xl font-bold text-accent">+24.8%</p>
                    <div className="h-1 w-full bg-border mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-[75%]" />
                    </div>
                  </div>
                  <div className="bg-background/50 p-6 rounded-3xl border border-border backdrop-blur-sm">
                    <p className="text-xs text-muted font-bold uppercase tracking-wider mb-2">Leads Hoy</p>
                    <p className="text-3xl font-bold text-primary">142</p>
                    <div className="h-1 w-full bg-border mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[60%]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="h-40 bg-background/50 rounded-3xl border border-border flex items-end p-6 gap-3 backdrop-blur-sm">
                    {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary/20 rounded-t-lg transition-all duration-500 hover:bg-primary hover:scale-y-110 origin-bottom" 
                        style={{ height: `${h}%` }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -top-6 -right-6 bg-accent text-background px-6 py-4 rounded-2xl font-bold shadow-2xl animate-bounce-slow flex items-center gap-3 z-20">
                <div className="w-2 h-2 bg-background rounded-full animate-ping" />
                New Lead! 🚀
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary px-6 py-4 rounded-2xl text-white font-bold shadow-2xl z-20 flex items-center gap-3">
                <TrendingUp size={20} />
                ROI: 4.5x
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-32 bg-card/30 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 reveal reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Nuestros Servicios</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Soluciones tecnológicas integrales diseñadas para digitalizar y escalar tu negocio físico sin complicaciones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 reveal-stagger">
            {[
              { icon: <Zap />, title: "Web High-Performance", price: "Desde $999", features: ["Diseño UX/UI Premium", "SEO Local Avanzado", "Velocidad de Carga < 1s", "Optimización Mobile First"] },
              { icon: <TrendingUp />, title: "Chatbot Automation", price: "Desde $499", features: ["IA Generativa Custom", "Cierre de Citas Automático", "Integración WhatsApp/Meta", "Flujos de Venta 24/7"] },
              { icon: <Target />, title: "Data Strategy", price: "Desde $799", features: ["Dashboards Personalizados", "Tracking de Conversión", "Análisis de Comportamiento", "Growth Hacking Mensual"] }
            ].map((service, i) => (
              <div key={i} className="interactive-card p-12 rounded-[3rem] group">
                <div className="text-primary mb-8 group-hover:scale-110 transition-transform w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-primary font-bold text-lg mb-8">{service.price}</p>
                <ul className="space-y-5 mb-10">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-muted text-sm">
                      <div className="bg-accent/10 p-1 rounded-full">
                        <Check size={14} className="text-accent" /> 
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className="w-full py-4 rounded-2xl border border-primary/20 text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all"
                >
                  Saber más
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS */}
      <section id="precios" className="py-32 bg-background relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 reveal reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Planes de Implementación</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Inversiones únicas para transformar tu infraestructura digital de raíz.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 reveal-stagger">
            {[
              { name: "Starter", price: "1.499", desc: "Ideal para pequeños negocios locales que necesitan presencia profesional.", features: ["Web Optimizada (5 secciones)", "Chatbot Básico de FAQ", "Google My Business Setup", "Soporte Email 30 días"] },
              { name: "Growth", price: "2.999", desc: "Nuestra solución más potente para escalar ventas y automatizar procesos.", features: ["Web Premium + Blog", "Chatbot IA con Citas", "Dashboard de Datos Básico", "Estrategia de Conversión", "Soporte Prioritario"], popular: true },
              { name: "Scale", price: "5.499", desc: "Dominio total del mercado con tecnología de vanguardia y análisis profundo.", features: ["Ecosistema Web Completo", "IA Personalizada Avanzada", "Dashboard de Datos Total", "Integración CRM", "Consultoría Semanal"] }
            ].map((pack, i) => (
              <div key={i} className={`p-12 rounded-[3rem] border transition-all duration-500 group ${pack.popular ? 'bg-primary/5 border-primary/50 relative scale-105 z-20 shadow-2xl shadow-primary/10' : 'bg-card border-border hover:border-primary/30'}`}>
                {pack.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
                    Recomendado
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold tracking-tighter">${pack.price}</span>
                  <span className="text-muted font-medium">/único</span>
                </div>
                <p className="text-muted mb-10 text-sm leading-relaxed h-12">{pack.desc}</p>
                <ul className="space-y-5 mb-12">
                  {pack.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-sm">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Check size={14} className="text-primary" />
                      </div>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className={`w-full py-5 rounded-2xl font-bold transition-all text-lg ${pack.popular ? 'bg-primary text-white hover:bg-primary/90 glow-primary' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  Seleccionar {pack.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUSCRIPCIONES (NUEVA SECCIÓN) */}
      <section id="suscripciones" className="py-32 bg-card/30 border-y border-border relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 reveal reveal-up">
            <span className="text-secondary font-bold text-sm uppercase tracking-widest mb-4 block">Mantenimiento y Evolución</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Zyneth Care Plans</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">No te quedes atrás. Mantén tu sistema optimizado, seguro y en constante evolución.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 reveal-stagger">
            {[
              { 
                name: "Basic Care", 
                price: "149", 
                icon: <Shield className="text-primary" />,
                features: ["Mantenimiento Web", "Seguridad y Backups", "Actualizaciones IA", "Reporte Mensual"] 
              },
              { 
                name: "Growth Care", 
                price: "399", 
                icon: <Rocket className="text-secondary" />,
                features: ["Todo en Basic", "Optimización de Conversión", "Nuevos Flujos Chatbot", "Dashboard en Vivo", "Soporte 24h"],
                featured: true
              },
              { 
                name: "Data Growth", 
                price: "799", 
                icon: <Activity className="text-accent" />,
                features: ["Todo en Growth", "Análisis Predictivo", "A/B Testing Continuo", "Consultoría Estratégica", "Integraciones Custom"] 
              }
            ].map((plan, i) => (
              <div key={i} className="bg-background p-10 rounded-[2.5rem] border border-border hover:border-secondary/50 transition-all group">
                <div className="mb-8 w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-muted">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className="w-full py-4 rounded-2xl border border-secondary/20 text-secondary font-bold hover:bg-secondary hover:text-white transition-all"
                >
                  Suscribirse
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="py-32 bg-primary/5 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center reveal reveal-up">
            {[
              { val: "+150", label: "Negocios Digitalizados" },
              { val: "45%", label: "Aumento en Conversión" },
              { val: "12k+", label: "Leads Generados/Mes" },
              { val: "4.9/5", label: "Rating de Clientes" }
            ].map((stat, i) => (
              <div key={i} className="">
                <p className="text-4xl md:text-7xl font-bold text-primary mb-4 tracking-tighter">{stat.val}</p>
                <p className="text-muted font-bold uppercase text-xs tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO (NUEVA SECCIÓN) */}
      <section id="contacto" className="py-32 bg-background relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto bg-card rounded-[3rem] border border-border overflow-hidden shadow-2xl reveal reveal-scale">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 md:p-20 bg-primary/5">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">Solicita tu análisis <span className="text-primary">gratuito</span></h2>
                <p className="text-muted text-lg mb-12 leading-relaxed">
                  Analizaremos tu presencia digital actual y te propondremos una hoja de ruta tecnológica para escalar tus ventas. Sin compromiso.
                </p>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-lg font-medium">zynethviral@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Teléfono</p>
                      <p className="text-lg font-medium">+34 633 105 922</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Oficina</p>
                      <p className="text-lg font-medium">Barrika, Pais Vasco</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 md:p-20">
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-wider">Nombre</label>
                      <input name="name" type="text" required placeholder="Tu nombre" className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-wider">Email</label>
                      <input name="email" type="email" required placeholder="tu@email.com" className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-wider">Negocio / Web</label>
                      <input name="business" type="text" required placeholder="www.tunegocio.com" className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-wider">Teléfono</label>
                      <input name="phone" type="tel" placeholder="+34 600 000 000" className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Mensaje (Objetivo)</label>
                    <textarea name="message" required placeholder="Cuéntanos sobre tu negocio..." rows={4} className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                  </div>
                  
                  {submitStatus && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${submitStatus.success ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {submitStatus.message}
                    </div>
                  )}

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 glow-primary-hover"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitud'} <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-background border-t border-border relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div 
                className="text-2xl font-bold tracking-tighter mb-8 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span className="text-white">Zy</span>
                <span className="text-primary">neth</span>
              </div>
              <p className="text-muted max-w-xs leading-relaxed mb-8">
                Impulsando la transformación digital de negocios físicos a través de tecnología de vanguardia y análisis de datos estratégico.
              </p>
              <div className="flex gap-4">
                {['LinkedIn', 'Twitter', 'Instagram'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-20 rounded-sm" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Navegación</h4>
              <ul className="space-y-4 text-muted font-medium">
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-primary transition-colors">Cómo funciona</button></li>
                <li><button onClick={() => scrollToSection('servicios')} className="hover:text-primary transition-colors">Servicios</button></li>
                <li><button onClick={() => scrollToSection('sistema')} className="hover:text-primary transition-colors">Sistema</button></li>
                <li><button onClick={() => scrollToSection('precios')} className="hover:text-primary transition-colors">Precios</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4 text-muted font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Cookies</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Aviso Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted font-medium">
            <p>© 2026 Zyneth Agency. Todos los derechos reservados.</p>
            <p>Diseñado con ❤️ para el crecimiento digital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
