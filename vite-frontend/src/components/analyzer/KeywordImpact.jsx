import React from "react";

const KeywordImpact = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="bg-white rounded shadow mt-4">
      <div className="bg-primary text-white p-3 rounded-t">
        <i className="fas fa-key mr-2"></i>Từ khóa ảnh hưởng đến kết quả
      </div>
      <div className="p-4">
        <p className="text-text-main mb-3">
          Các từ khóa sau có ảnh hưởng đến việc xác định email là spam hay không
          (sắp xếp theo mức độ ảnh hưởng):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300 text-left">
                  Từ khóa
                </th>
                <th className="p-2 border border-gray-300 text-left">
                  Mức độ ảnh hưởng
                </th>
                <th className="p-2 border border-gray-300 text-left">
                  Giải thích
                </th>
              </tr>
            </thead>
            <tbody>
              {keywords.slice(0, 10).map((keyword, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="p-2 border border-gray-300">
                    <span
                      className={`inline-block px-2 py-1 rounded text-white ${
                        Math.abs(keyword.impact) > 1
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {keyword.word}
                    </span>
                  </td>
                  <td className="p-2 border border-gray-300">
                    <div className="w-full bg-gray-200 rounded-full h-5">
                      <div
                        className={`h-5 rounded-full ${
                          keyword.impact > 0 ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.abs(keyword.impact * 20),
                            100
                          )}%`,
                        }}
                      >
                        <span className="px-2 text-white text-xs text-center block leading-5">
                          {Math.abs(keyword.impact).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 border border-gray-300 text-text-main">
                    {keyword.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-text-secondary text-xs mt-3">
          <i className="fas fa-info-circle mr-1"></i>
          Mức độ ảnh hưởng càng cao, từ khóa càng quan trọng trong việc phân
          loại email. Màu đỏ thể hiện xu hướng phân loại là spam, màu xanh thể
          hiện xu hướng phân loại là email thường.
        </p>
      </div>
    </div>
  );
};

export default KeywordImpact;
