import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignaturePadProps {
    onSignatureCapture: (signatureData: string, signerName: string, signerEmail: string) => void;
    isLoading?: boolean;
    defaultName?: string;
    defaultEmail?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
    onSignatureCapture, 
    isLoading = false,
    defaultName = '',
    defaultEmail = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signerName, setSignerName] = useState(defaultName);
    const [signerEmail, setSignerEmail] = useState(defaultEmail);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    };

    const handleSubmit = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!signerName.trim()) {
            alert('Please enter your name');
            return;
        }

        if (!signerEmail.trim()) {
            alert('Please enter your email');
            return;
        }

        // Get canvas as base64
        const signatureData = canvas.toDataURL('image/png');

        onSignatureCapture(signatureData, signerName, signerEmail);
    };

    return (
        <div className="space-y-6 p-6 border rounded-lg bg-white">
            <div>
                <h3 className="text-lg font-semibold mb-4">Sign the Document</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Please sign below to indicate your acceptance of this agreement.
                </p>
            </div>

            {/* Signature Canvas */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Your Signature</Label>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full border-2 border-gray-300 rounded cursor-crosshair bg-white"
                    style={{ touchAction: 'none' }}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    disabled={isLoading}
                    className="w-full"
                >
                    Clear Signature
                </Button>
            </div>

            {/* Signer Information */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="signer-name" className="text-sm font-medium">
                        Full Name
                    </Label>
                    <Input
                        id="signer-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="signer-email" className="text-sm font-medium">
                        Email Address
                    </Label>
                    <Input
                        id="signer-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.target.value)}
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !signerName.trim() || !signerEmail.trim()}
                    className="flex-1"
                >
                    {isLoading ? 'Signing...' : 'Sign and Submit'}
                </Button>
            </div>

            {/* Signature Information */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Signature Information:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your signature will be timestamp recorded</li>
                    <li>Your IP address will be logged for security</li>
                    <li>Once signed, the agreement cannot be modified</li>
                    <li>You will receive a confirmation email</li>
                </ul>
            </div>
        </div>
    );
};

export default SignaturePad;
