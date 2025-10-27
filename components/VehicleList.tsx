import React from 'react';
import { Vehicle, VehicleTypeMaster } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface VehicleListProps {
    vehicles: Vehicle[];
    tenderId: string;
    onDeleteVehicle: (tenderId: string, vehicleId: string) => void;
    vehicleTypes: VehicleTypeMaster[];
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, tenderId, onDeleteVehicle, vehicleTypes }) => {
    if (vehicles.length === 0) {
        return <p className="text-center text-slate-500 py-4">No vehicles have been added to this tender yet.</p>;
    }

    const getVehicleTypeName = (typeId: string) => {
        return vehicleTypes.find(vt => vt.id === typeId)?.name || 'N/A';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Make</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lease Period</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Driver Option</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{vehicle.make}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vehicle.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vehicle.modelYear}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vehicle.qty}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getVehicleTypeName(vehicle.vehicleTypeId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vehicle.leasePeriod ? `${vehicle.leasePeriod} months` : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vehicle.driverOption}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onDeleteVehicle(tenderId, vehicle.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete Vehicle"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VehicleList;