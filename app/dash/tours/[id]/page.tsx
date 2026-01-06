'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import RejectModal from '@/components/RejectModal';

const tourSchema = z.object({
  guide_id: z.string().min(1, 'Selecione o guia principal'),
  auxiliary_guide_id: z.string().optional(),
  date_time: z.string().min(1, 'Selecione a data e hora do passeio'),
  address: z.string().min(3, 'Informe o local do passeio'),
  visitor_profile: z.string().min(1, 'Selecione o perfil do visitante'),
  accommodation_type: z.string().min(1, 'Selecione o tipo de acomodação'),
  stay_days: z.number().min(1, 'Informe quantos dias os visitantes ficarão'),
  age_range: z.string().min(1, 'Selecione a faixa etária'),
  status: z.string().default('PENDING'),
  status_details: z.string().optional()
})

type TourFormData = z.infer<typeof tourSchema>

interface Agency {
  id: string;
  name: string;
  type: string;
}

interface TourTemplate {
  id: string;
  name: string;
  description: string | null;
  requires_guide: boolean;
}

interface UserAgency {
  id: string;
  name: string;
  type: string;
}

export default function TourFormPage({ params }: { params: { id?: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = !!params?.id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [tourLoaded, setTourLoaded] = useState(false);
  const [allGuides, setAllGuides] = useState<Agency[]>([]);
  const [tourTemplates, setTourTemplates] = useState<TourTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [userAgency, setUserAgency] = useState<UserAgency | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      status: 'PENDING',
      stay_days: 1
    }
  });

  const formData = watch();

  // Fetch user's agency and all guides
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

        // Admin não precisa de agência
        if (!isAdmin) {
          // Buscar a agência do usuário logado
          const agencyRes = await fetch('/api/agency/my-agency');

          if (agencyRes.status === 401 || agencyRes.status === 403) {
            toast.error('Você não tem permissão para acessar esta página');
            router.push('/dash');
            return;
          }

          if (agencyRes.ok) {
            const agencyData = await agencyRes.json();
            if (agencyData.agency) {
              setUserAgency(agencyData.agency);

              // Se for guia autônomo, já setar como guide_id
              if (agencyData.agency.type === 'GUIDE') {
                setValue('guide_id', agencyData.agency.id);
              }
            } else {
              toast.error('Você precisa ter uma agência cadastrada');
              router.push('/dash');
              return;
            }
          }
        }

        // Buscar todos os guias aprovados
        const guidesRes = await fetch('/api/agency?type=GUIDE&status=APPROVED');
        if (guidesRes.ok) {
          const guidesData = await guidesRes.json();
          setAllGuides(Array.isArray(guidesData) ? guidesData : []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoadingData(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [router, session]);  // Fetch tour templates
  useEffect(() => {
    fetch('/api/tour-templates')
      .then((res) => res.json())
      .then((data) => setTourTemplates(Array.isArray(data) ? data : []))
      .catch(() => {
        toast.error('Erro ao carregar passeios');
        setTourTemplates([]);
      });
  }, []);

  // Load tour data if editing
  useEffect(() => {
    if (isEditing && params.id && !tourLoaded) {
      const loadTour = async () => {
        try {
          const res = await fetch(`/api/tours/${params.id}`);
          if (!res.ok) throw new Error('Erro ao carregar passeio');

          const tour = await res.json();
          setValue('guide_id', tour.guide_id || '');
          setValue('auxiliary_guide_id', tour.auxiliary_guide_id || '');
          setValue('date_time', new Date(tour.date_time).toISOString().slice(0, 16));
          setValue('address', tour.address);
          setValue('visitor_profile', tour.visitor_profile);
          setValue('accommodation_type', tour.accommodation_type);
          setValue('stay_days', tour.stay_days);
          setValue('age_range', tour.age_range);
          setValue('status', tour.status);
          setValue('status_details', tour.status_details || '');
          setTourLoaded(true);
        } catch (error: any) {
          toast.error(error.message);
          router.push('/dash/tours');
        }
      };

      loadTour();
    }
  }, [isEditing, params.id, tourLoaded, router]);

  const onSubmit = async (data: TourFormData) => {
    setLoading(true);

    try {
      // Calcula dias de antecedência automaticamente
      const tourDate = new Date(data.date_time);
      const today = new Date();
      const diffTime = tourDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const dataToSend = {
        ...data,
        auxiliary_guide_id: data.auxiliary_guide_id || null,
        request_date: diffDays > 0 ? diffDays : 0, // Dias de antecedência calculado
      };

      const url = isEditing ? `/api/tours/${params.id}` : '/api/tours';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao salvar passeio');
      }

      toast.success(isEditing ? 'Passeio atualizado!' : 'Passeio criado!');
      router.push('/dash/tours');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Deseja cancelar este passeio?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tours/${params.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao cancelar passeio');
      }

      toast.success('Passeio cancelado!');
      router.push('/dash/tours');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        auxiliary_guide_id: formData.auxiliary_guide_id || null,
        status: 'APPROVED',
        status_details: null,
      };

      const res = await fetch(`/api/tours/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao aprovar passeio');
      }

      toast.success('Passeio aprovado!');
      setShowApproveModal(false);
      router.push('/dash/tours');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        auxiliary_guide_id: formData.auxiliary_guide_id || null,
        status: 'REJECTED',
        status_details: reason,
      };

      const res = await fetch(`/api/tours/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao rejeitar passeio');
      }

      toast.success('Passeio rejeitado!');
      setShowRejectModal(false);
      router.push('/dash/tours');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dash/tours"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Passeio' : 'Cadastrar Passeio'}
        </h1>
        <p className="text-sm text-gray-600 mt-2">* Campos obrigatórios</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Seletor de Passeio Cadastrado */}
          {!isEditing && tourTemplates.length > 0 && (
            <div>
              <label htmlFor="template_selector" className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Passeio Cadastrado (Opcional)
              </label>
              <select
                id="template_selector"
                value={selectedTemplate}
                onChange={(e) => {
                  const template = tourTemplates.find(t => t.id === e.target.value);
                  if (template) {
                    setValue('address', template.name);
                  }
                  setSelectedTemplate(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um passeio cadastrado...</option>
                {tourTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Ao selecionar um passeio, o campo "Local do Passeio" será preenchido automaticamente
              </p>
            </div>
          )}

          {/* Data e Hora */}
          <div>
            <label htmlFor="date_time" className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora do Passeio *
            </label>
            <input
              type="datetime-local"
              {...register('date_time')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date_time ? 'border-red-600' : 'border-gray-300'
                }`}
            />
            {errors.date_time && <p className="text-red-600 text-sm mt-1">{errors.date_time.message}</p>}
          </div>

          {/* Guia Principal */}
          {userAgency?.type === 'GUIDE' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guia Principal *
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-900">{userAgency.name}</p>
                <p className="text-xs text-gray-500 mt-1">Você será automaticamente definido como guia principal</p>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="guide_id" className="block text-sm font-medium text-gray-700 mb-2">
                Guia Principal *
              </label>
              <select
                {...register('guide_id')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.guide_id ? 'border-red-600' : 'border-gray-300'
                  }`}
              >
                <option value="">Selecione um guia...</option>
                {allGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
              </select>
              {errors.guide_id && <p className="text-red-600 text-sm mt-1">{errors.guide_id.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {isAdmin ? 'Selecione o guia que conduzirá o passeio' : 'Selecione o guia certificado que conduzirá o passeio'}
              </p>
            </div>
          )}

          {/* Guia Auxiliar */}
          <div>
            <label htmlFor="auxiliary_guide_id" className="block text-sm font-medium text-gray-700 mb-2">
              Guia Auxiliar (Opcional)
            </label>
            <select
              {...register('auxiliary_guide_id')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sem guia auxiliar</option>
              {allGuides
                .filter(guide => guide.id !== formData.guide_id)
                .map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Adicione um segundo guia caso necessário</p>
          </div>

          {/* Local do Passeio */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Local do Passeio *
            </label>
            <input
              type="text"
              {...register('address')}
              placeholder="Ex: Praia de Ponta Negra, Centro Histórico..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-600' : 'border-gray-300'
                }`}
            />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
          </div>

          {/* Perfil do Visitante */}
          <div>
            <label htmlFor="visitor_profile" className="block text-sm font-medium text-gray-700 mb-2">
              Perfil do Visitante *
            </label>
            <select
              {...register('visitor_profile')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.visitor_profile ? 'border-red-600' : 'border-gray-300'
                }`}
            >
              <option value="">Selecione...</option>
              <option value="FAMILY_OR_FRIENDS">Família ou amigos</option>
              <option value="SCHOOL">Escola</option>
              <option value="TOUR_GROUP">Grupo de turismo</option>
              <option value="TECHNICAL_VISIT">Visita técnica</option>
              <option value="SOCIAL_PROJECT">Projeto social</option>
              <option value="OTHER">Outro</option>
            </select>
            {errors.visitor_profile && <p className="text-red-600 text-sm mt-1">{errors.visitor_profile.message}</p>}
          </div>

          {/* Tipo de Acomodação */}
          <div>
            <label htmlFor="accommodation_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Acomodação *
            </label>
            <select
              {...register('accommodation_type')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.accommodation_type ? 'border-red-600' : 'border-gray-300'
                }`}
            >
              <option value="">Selecione...</option>
              <option value="OWN_HOUSE">Casa própria</option>
              <option value="HOTEL">Hotel</option>
              <option value="FRIENDS_OR_FAMILY">Casa de amigos/família</option>
              <option value="HOSTEL">Hostel</option>
              <option value="FLAT">Flat</option>
              <option value="RESORT">Resort</option>
              <option value="AIRBNB">Airbnb</option>
              <option value="OTHER">Outro</option>
            </select>
            {errors.accommodation_type && <p className="text-red-600 text-sm mt-1">{errors.accommodation_type.message}</p>}
          </div>

          {/* Faixa Etária */}
          <div>
            <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
              Faixa Etária Predominante *
            </label>
            <select
              {...register('age_range')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.age_range ? 'border-red-600' : 'border-gray-300'
                }`}
            >
              <option value="">Selecione...</option>
              <option value="ZERO_TO_NINE">0-9 anos</option>
              <option value="TEN_TO_EIGHTEEN">10-18 anos</option>
              <option value="NINETEEN_TO_TWENTY_NINE">19-29 anos</option>
              <option value="THIRTY_TO_FORTY_FIVE">30-45 anos</option>
              <option value="FORTY_SIX_TO_SIXTY_FIVE">46-65 anos</option>
              <option value="OVER_SIXTY_FIVE">65+ anos</option>
            </select>
            {errors.age_range && <p className="text-red-600 text-sm mt-1">{errors.age_range.message}</p>}
          </div>

          {/* Dias de Permanência */}
          <div>
            <label htmlFor="stay_days" className="block text-sm font-medium text-gray-700 mb-2">
              Quantos dias os visitantes ficarão? *
            </label>
            <input
              type="number"
              {...register('stay_days', { valueAsNumber: true })}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stay_days ? 'border-red-600' : 'border-gray-300'
                }`}
              placeholder="Número de dias"
            />
            {errors.stay_days && <p className="text-red-600 text-sm mt-1">{errors.stay_days.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Informe por quantos dias os visitantes permanecerão na região</p>
          </div>

          {/* Status e Observações (somente visualização) */}
          {isEditing && formData.status !== 'PENDING' && (
            <div className={`p-4 rounded-lg border-2 ${formData.status === 'APPROVED'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${formData.status === 'APPROVED'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                  }`}>
                  {formData.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                </span>
              </div>
              {formData.status_details && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                  <p className="text-sm text-gray-600">{formData.status_details}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            {isEditing && !isAdmin && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Cancelar Passeio
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {/* Botões Admin para Aprovar/Rejeitar */}
            {isAdmin && isEditing && formData.status === 'PENDING' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dash/tours"
                  className="px-6 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* Modals */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Aprovar Passeio"
        message="Tem certeza que deseja aprovar este passeio?"
        confirmText="Aprovar"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        isLoading={loading}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rejeitar Passeio"
        message="Informe o motivo da rejeição. Esta mensagem será exibida para o guia."
        placeholder="Ex: Documentação incompleta, data inválida, informações incorretas..."
        confirmText="Rejeitar Passeio"
        isLoading={loading}
      />
    </div>
  );
}
