import axios from "axios";
import { ResponseGetSpecification } from "./dto";

export class QrProvider {
  private static baseUrl: string = process.env.OPERATIONS_BASE_URL;

  static async getQrSpecifications(incomeData: {
    Q: [][];
    R: [][];
  }): Promise<ResponseGetSpecification> {
    const url = `${QrProvider.baseUrl}/specifications`;
    const { data } = await axios.get(url, {
      data: incomeData,
    });

    const result = data.data;

    return result;
  }
}
