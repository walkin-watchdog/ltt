import { Calendar } from "lucide-react";

   export const AbandonedCartPrompt = ({
    showRecoveryPrompt,
    handleRecoverCart,
    dismissRecoveryPrompt,
}: {
    showRecoveryPrompt: boolean;
    handleRecoverCart: () => void;
    dismissRecoveryPrompt: () => void;
}) => {
    return (
   <div>

   {showRecoveryPrompt && (
       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-blue-700 font-medium">You have an unfinished booking for this product</p>
                                <div className="mt-2 flex items-center">
                                    <button
                                        onClick={handleRecoverCart}
                                        className="mr-4 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                                        >
                                        Continue Booking
                                    </button>
                                    <button
                                        onClick={dismissRecoveryPrompt}
                                        className="text-blue-700 hover:text-blue-900 text-sm"
                                        >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            )}