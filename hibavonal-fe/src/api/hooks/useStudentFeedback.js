import { apiPost } from '../fetcher';

const useStudentFeedback = () => {
  const createFeedback = async (ticketId, details) => {
    return apiPost('/api/student-feedback', { ticket_id: ticketId, details });
  };

  return { createFeedback };
};

export default useStudentFeedback;
